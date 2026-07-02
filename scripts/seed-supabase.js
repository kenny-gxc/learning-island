/**
 * 数据迁移脚本：将 data/db.json 中的数据导入 Supabase
 *
 * 用法：
 *   1. 先在 Supabase SQL Editor 运行 supabase/schema.sql
 *   2. 确保 .env.local 中已配置 Supabase 环境变量
 *   3. node scripts/seed-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 从 .env.local 加载环境变量
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('请替换')) {
  console.error('❌ 请在 .env.local 中先配置 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('正在从 data/db.json 迁移数据到 Supabase...\n');

  const dbPath = join(__dirname, '..', 'data', 'db.json');
  const db = JSON.parse(readFileSync(dbPath, 'utf-8'));

  // 1. 导入用户
  if (db.users?.length > 0) {
    const { error } = await supabase.from('users').upsert(
      db.users.map(u => ({ id: u.id, name: u.name, created_at: u.createdAt })),
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (error) {
      console.error('❌ 用户导入失败:', error.message);
    } else {
      console.log(`✅ 导入 ${db.users.length} 个用户`);
    }
  }

  // 2. 导入学习记录
  if (db.learningRecords?.length > 0) {
    const { error } = await supabase.from('learning_records').insert(
      db.learningRecords.map(r => ({
        user_id: r.userId,
        subject: r.subject,
        question: r.question,
        options: typeof r.options === 'string' ? JSON.parse(r.options) : (r.options || []),
        answer: r.answer,
        user_answer: r.userAnswer,
        correct: r.correct,
        difficulty: r.difficulty || 'medium',
        knowledge_point: r.knowledgePoint || '',
        mistake_type: r.mistakeType || '',
        time_spent: r.timeSpent || 0,
        created_at: r.createdAt || new Date().toISOString(),
      }))
    );
    if (error) {
      console.error('❌ 学习记录导入失败:', error.message);
    } else {
      console.log(`✅ 导入 ${db.learningRecords.length} 条学习记录`);
    }
  }

  // 3. 导入错题本
  if (db.errorBook?.length > 0) {
    const { error } = await supabase.from('error_book').insert(
      db.errorBook.map(e => ({
        user_id: e.userId,
        subject: e.subject,
        question: e.question,
        options: typeof e.options === 'string' ? JSON.parse(e.options) : (e.options || []),
        answer: e.answer,
        user_answer: e.userAnswer,
        knowledge_point: e.knowledgePoint || '',
        mistake_type: e.mistakeType || '',
        retry_count: e.retryCount || 0,
        mastered: e.mastered || 0,
        created_at: e.createdAt || new Date().toISOString(),
        mastered_at: e.masteredAt || null,
        last_reviewed_at: e.lastReviewedAt || new Date().toISOString(),
      }))
    );
    if (error) {
      console.error('❌ 错题本导入失败:', error.message);
    } else {
      console.log(`✅ 导入 ${db.errorBook.length} 条错题记录`);
    }
  }

  // 4. 导入用户进度
  if (db.userProgress?.length > 0) {
    const { error } = await supabase.from('user_progress').upsert(
      db.userProgress.map(p => ({
        user_id: p.userId,
        subject: p.subject,
        correct_count: p.correctCount || 0,
        total_count: p.totalCount || 0,
        experience: p.experience || 0,
        last_study_date: p.lastStudyDate || '',
      })),
      { onConflict: 'user_id,subject', ignoreDuplicates: true }
    );
    if (error) {
      console.error('❌ 用户进度导入失败:', error.message);
    } else {
      console.log(`✅ 导入 ${db.userProgress.length} 条进度记录`);
    }
  }

  // 5. 导入成就
  if (db.achievements?.length > 0) {
    const { error } = await supabase.from('achievements').upsert(
      db.achievements.map(a => ({
        user_id: a.userId,
        badge_id: a.badgeId,
        unlocked_at: a.unlockedAt || new Date().toISOString(),
      })),
      { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
    );
    if (error) {
      console.error('❌ 成就导入失败:', error.message);
    } else {
      console.log(`✅ 导入 ${db.achievements.length} 条成就记录`);
    }
  }

  console.log('\n🎉 数据迁移完成！');
  console.log('现在可以在浏览器中打开应用验证数据是否正常。');
}

main().catch(err => {
  console.error('❌ 迁移失败:', err);
  process.exit(1);
});
