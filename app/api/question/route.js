import { generateQuestion } from '@/lib/ai';

export async function POST(request) {
  try {
    const body = await request.json();
    const { subject, difficulty, knowledgePoint, history, questionType } = body;

    const question = await generateQuestion(subject, {
      difficulty: difficulty || 'medium',
      knowledgePoint: knowledgePoint || '',
      history: history || '',
      questionType: questionType || 'auto',
    });

    const { answer, ...publicQuestion } = question;

    return Response.json({
      success: true,
      question: publicQuestion,
      answer: answer,
    });
  } catch (error) {
    console.error('出题失败:', error);
    return Response.json({
      success: false,
      error: '出题失败，请稍后再试',
      question: {
        question: '🤔 基础题',
        questionText: '3 + 5 = ?',
        type: 'calculation',
        options: [],
        difficulty: 'easy',
        knowledgePoint: '加法',
        explanation: '3 + 5 等于 8 哦！',
        hint: '数一数你的手指头',
      },
      answer: '8',
    });
  }
}
