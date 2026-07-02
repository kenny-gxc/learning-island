import { evaluateAnswer } from '@/lib/ai';
import { recordAnswer, unlockAchievement, getLearningStats, getLevel, getRecentRecords } from '@/lib/db';

export async function POST(request) {
  const body = await request.json();
  const { userId, subject, question, userAnswer, timeSpent } = body;

  // 1. 批改（AI 或字符串对比兜底）
  let result;
  try {
    result = await evaluateAnswer(question, userAnswer);
  } catch (e) {
    console.error('AI批改失败:', e);
    const isCorrect = String(userAnswer).trim() === String(question?.answer).trim();
    result = {
      correct: isCorrect,
      score: isCorrect ? 100 : 0,
      explanation: isCorrect ? '太棒了！回答正确！👏' : '哎呀，答案是 ' + question?.answer + ' 哦！🤔',
      mistakeType: isCorrect ? '正确' : '粗心',
      encouragement: isCorrect ? '你真聪明！继续保持！🌟' : '没关系，下次加油！💪',
    };
  }

  // 2. 数据库操作（独立 try，不影响批改结果返回）
  try {
    const { newExp } = await recordAnswer({
      userId,
      subject,
      question: question.questionText,
      options: question.options || [],
      answer: question.answer,
      userAnswer,
      correct: result.correct,
      difficulty: question.difficulty || 'medium',
      knowledgePoint: question.knowledgePoint || '',
      mistakeType: result.mistakeType || '',
      timeSpent: timeSpent || 0,
    });

    const stats = await getLearningStats(userId, subject);
    const newAchievements = [];

    if (result.correct) {
      const recent = await getRecentRecords(userId, subject, 10);
      if (recent.length >= 10 && recent.every(r => r.correct)) {
        const unlocked = await unlockAchievement(userId, 'math-streak-10');
        if (unlocked) newAchievements.push({ badgeId: 'math-streak-10', title: '🏅 计算小能手' });
      }
    }

    if (result.correct && timeSpent <= 10) {
      const unlocked = await unlockAchievement(userId, 'speed-demon');
      if (unlocked) newAchievements.push({ badgeId: 'speed-demon', title: '🏅 闪电侠' });
    }

    const levelInfo = getLevel(stats?.experience || 0);

    return Response.json({
      success: true,
      ...result,
      experience: result.correct ? 10 : 2,
      level: levelInfo,
      stats,
      newAchievements,
    });
  } catch (e) {
    // 数据库出错，只返回批改结果
    console.error('数据库记录失败:', e);
    return Response.json({
      success: true,
      ...result,
      experience: result.correct ? 10 : 2,
      level: { level: 1, title: '🌱 小种子' },
      stats: null,
      newAchievements: [],
    });
  }
}
