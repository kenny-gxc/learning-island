CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name ON users(name);

CREATE TABLE IF NOT EXISTS learning_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK(subject IN ('math', 'yuven', 'english')),
  question TEXT NOT NULL,
  options TEXT,
  answer TEXT NOT NULL,
  user_answer TEXT,
  correct INTEGER NOT NULL CHECK(correct IN (0, 1)),
  difficulty TEXT DEFAULT 'medium',
  knowledge_point TEXT,
  mistake_type TEXT,
  time_spent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_records_user_subject ON learning_records(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_records_created ON learning_records(created_at);

CREATE TABLE IF NOT EXISTS error_book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT,
  answer TEXT NOT NULL,
  user_answer TEXT,
  knowledge_point TEXT,
  mistake_type TEXT,
  retry_count INTEGER DEFAULT 0,
  mastered INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  mastered_at TEXT,
  last_reviewed_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_errors_user_subject ON error_book(user_id, subject);

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL CHECK(subject IN ('math', 'yuven', 'english')),
  current_level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_study_date TEXT,
  current_difficulty TEXT DEFAULT 'easy',
  current_knowledge_point TEXT DEFAULT '',
  UNIQUE(user_id, subject)
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT (datetime('now', 'localtime')),
  UNIQUE(user_id, badge_id)
);
