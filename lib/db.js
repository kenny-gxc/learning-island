import { supabase } from './supabase';

// ===== 辅助函数：将 snake_case 转为 camelCase =====
function toCamel(row) {
  if (!row || typeof row !== 'object') return row;
  if (Array.isArray(row)) return row.map(toCamel);
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value,
    ])
  );
}

// ===== Users =====

export async function findUserByName(name) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel(data) : null;
}

export async function createUser(name) {
  const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const { data, error } = await supabase
    .from('users')
    .insert({ id, name, created_at: new Date().toLocaleString('zh-CN') })
    .select('*')
    .single();
  if (error) throw error;
  return toCamel(data);
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toCamel);
}

// ===== Learning Records =====

export async function recordAnswer({
  userId, subject, question, options, answer, userAnswer,
  correct, difficulty, knowledgePoint, mistakeType, timeSpent,
}) {
  const { data, error } = await supabase.rpc('record_answer_v2', {
    p_user_id: userId,
    p_subject: subject,
    p_question: question,
    p_options: options || [],
    p_answer: answer,
    p_user_answer: userAnswer,
    p_correct: correct ? 1 : 0,
    p_difficulty: difficulty || 'medium',
    p_knowledge_point: knowledgePoint || '',
    p_mistake_type: mistakeType || '',
    p_time_spent: timeSpent || 0,
  });
  if (error) throw error;
  return data;
}

export async function getLearningStats(userId, subject) {
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .maybeSingle();

  const { data: recent } = await supabase
    .from('learning_records')
    .select('correct')
    .eq('user_id', userId)
    .eq('subject', subject)
    .order('created_at', { ascending: false })
    .limit(20);

  const recentTotal = recent?.length || 0;
  const recentCorrect = recent?.filter(r => r.correct).length || 0;
  const recentRate = recentTotal > 0 ? Math.round(recentCorrect / recentTotal * 100) : 0;

  return {
    totalQuestions: progress?.total_count || 0,
    correctRate: progress?.total_count > 0
      ? Math.round((progress.correct_count || 0) / progress.total_count * 100)
      : 0,
    recentRate,
    experience: progress?.experience || 0,
    level: 1,
    streak: 0,
  };
}

export async function getErrors(userId, subject) {
  const { data, error } = await supabase
    .from('error_book')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('mastered', 0)
    .order('last_reviewed_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toCamel);
}

export async function getAchievements(userId) {
  const { data, error } = await supabase
    .from('achievements')
    .select('badge_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(a => a.badge_id);
}

export async function getRecentRecords(userId, subject, limit = 10) {
  const { data, error } = await supabase
    .from('learning_records')
    .select('correct')
    .eq('user_id', userId)
    .eq('subject', subject)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).reverse();
}

export async function unlockAchievement(userId, badgeId) {
  const { error } = await supabase
    .from('achievements')
    .insert({ user_id: userId, badge_id: badgeId });
  if (error && error.code === '23505') return false;
  if (error) throw error;
  return true;
}

// ===== 等级系统（纯函数） =====

export function getLevel(experience) {
  if (experience >= 500) return { level: 6, title: '🏅 小学霸' };
  if (experience >= 300) return { level: 5, title: '⭐ 小明星' };
  if (experience >= 150) return { level: 4, title: '🌳 小树' };
  if (experience >= 70) return { level: 3, title: '🌻 小花' };
  if (experience >= 25) return { level: 2, title: '🌿 小芽' };
  return { level: 1, title: '🌱 小种子' };
}

// ===== 弃用函数桩 =====

const getDB = () => { throw new Error('getDB 已废弃'); };
const load = () => { throw new Error('load 已废弃'); };
const save = () => { throw new Error('save 已废弃'); };
const getProgress = async () => null;
const markErrorMastered = async () => {};
const updateDifficulty = async () => {};
const query = () => { throw new Error('请使用具体函数'); };
const execute = () => { throw new Error('请使用具体函数'); };

export {
  getDB, load, save,
  getProgress, markErrorMastered, updateDifficulty, query, execute,
};
