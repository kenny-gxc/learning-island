-- ============================================
-- 学习小岛 - Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name ON users (name);

-- 2. 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct SMALLINT NOT NULL DEFAULT 0 CHECK (correct IN (0, 1)),
  difficulty TEXT NOT NULL DEFAULT 'medium',
  knowledge_point TEXT DEFAULT '',
  mistake_type TEXT DEFAULT '',
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_user_subject ON learning_records (user_id, subject);
CREATE INDEX IF NOT EXISTS idx_learning_created ON learning_records (created_at DESC);

-- 3. 错题本
CREATE TABLE IF NOT EXISTS error_book (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  knowledge_point TEXT DEFAULT '',
  mistake_type TEXT DEFAULT '',
  retry_count INTEGER DEFAULT 0,
  mastered SMALLINT NOT NULL DEFAULT 0 CHECK (mastered IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mastered_at TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_user_subject ON error_book (user_id, subject);
CREATE INDEX IF NOT EXISTS idx_error_mastered ON error_book (mastered);

-- 4. 用户进度
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  last_study_date TEXT DEFAULT '',
  PRIMARY KEY (user_id, subject)
);

-- 5. 成就徽章
CREATE TABLE IF NOT EXISTS achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================
-- 存储过程：原子性记录答题结果
-- 在一次数据库事务中完成：插入记录 + 更新进度 + 管理错题本
-- ============================================
CREATE OR REPLACE FUNCTION record_answer_v2(
  p_user_id TEXT,
  p_subject TEXT,
  p_question TEXT,
  p_options JSONB,
  p_answer TEXT,
  p_user_answer TEXT,
  p_correct SMALLINT,
  p_difficulty TEXT,
  p_knowledge_point TEXT,
  p_mistake_type TEXT,
  p_time_spent INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_exp INTEGER;
  v_total INTEGER;
  v_correct INTEGER;
  v_existing_id BIGINT;
BEGIN
  -- 1. 插入学习记录
  INSERT INTO learning_records
    (user_id, subject, question, options, answer, user_answer,
     correct, difficulty, knowledge_point, mistake_type, time_spent)
  VALUES
    (p_user_id, p_subject, p_question, p_options, p_answer, p_user_answer,
     p_correct, p_difficulty, p_knowledge_point, p_mistake_type, p_time_spent);

  -- 2. 更新用户进度（原子性 upsert）
  INSERT INTO user_progress (user_id, subject, correct_count, total_count, experience, last_study_date)
  VALUES (p_user_id, p_subject, 0, 0, 0, '')
  ON CONFLICT (user_id, subject) DO NOTHING;

  UPDATE user_progress
  SET
    total_count = user_progress.total_count + 1,
    correct_count = user_progress.correct_count + CASE WHEN p_correct = 1 THEN 1 ELSE 0 END,
    experience = user_progress.experience + CASE WHEN p_correct = 1 THEN 10 ELSE 2 END,
    last_study_date = to_char(NOW(), 'YYYY/MM/DD HH24:MI:SS')
  WHERE user_id = p_user_id AND subject = p_subject
  RETURNING experience, total_count, correct_count INTO v_exp, v_total, v_correct;

  -- 3. 管理错题本
  IF p_correct = 0 THEN
    SELECT id INTO v_existing_id FROM error_book
    WHERE user_id = p_user_id AND subject = p_subject
      AND question = p_question AND mastered = 0
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      UPDATE error_book
      SET retry_count = retry_count + 1, last_reviewed_at = NOW()
      WHERE id = v_existing_id;
    ELSE
      INSERT INTO error_book
        (user_id, subject, question, options, answer, user_answer,
         knowledge_point, mistake_type, retry_count, mastered, last_reviewed_at)
      VALUES
        (p_user_id, p_subject, p_question, p_options, p_answer, p_user_answer,
         p_knowledge_point, p_mistake_type, 0, 0, NOW());
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'correct', p_correct,
    'newExp', v_exp,
    'newTotal', v_total,
    'newCorrect', v_correct
  );
END;
$$;
