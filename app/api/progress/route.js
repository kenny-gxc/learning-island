import { getLearningStats, getLevel, getAchievements, getErrors } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, subject } = body;

    if (subject) {
      const stats = await getLearningStats(userId, subject);
      const levelInfo = getLevel(stats.experience);
      const errors = await getErrors(userId, subject);
      return Response.json({
        success: true,
        stats: { ...stats, level: levelInfo },
        errors: errors.slice(0, 10),
      });
    }

    const subjects = ['math', 'yuven', 'english'];
    const allStats = {};
    for (const s of subjects) {
      const stats = await getLearningStats(userId, s);
      allStats[s] = { ...stats, level: getLevel(stats.experience) };
    }

    const achievements = await getAchievements(userId);
    return Response.json({
      success: true,
      stats: allStats,
      achievements,
    });
  } catch (error) {
    console.error('获取进度失败:', error);
    return Response.json({ success: false, error: '获取失败' });
  }
}
