# 全科AI自适应学习系统 — 设计规范

> 为青岛市市南区南京路小学二年级学生设计
> 版本：v1.0 | 日期：2026-06-30

---

## 一、项目概述

### 1.1 目标用户
- **主要用户**：二年级学生（小名"弟弟"），7-8岁
- **所在学校**：青岛市市南区南京路小学
- **使用方式**：自主使用，界面儿童友好

### 1.2 核心理念
> "吃不饱就往前喂"——自适应学习路径，能力到了就自动推进

**两大支柱**：
1. **提升能力** — 同步→预习→超前→竞赛思维，逐级进阶
2. **充满新意** — AI互动出题、游戏化成就、动态视觉反馈

### 1.3 教材版本
| 科目 | 教材 | 出版社 |
|------|------|--------|
| 语文 | 人教版（部编版） | 人民教育出版社 |
| 数学 | 青岛版（六三制） | 青岛出版社 |
| 英语 | 外研社《新标准英语》一年级起点 | 外语教学与研究出版社 |

---

## 二、系统架构

### 2.1 整体架构图

```
┌────────────────────────────────────────────────────────┐
│                   前端（Web App）                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐    │
│  │ 科目选择  │ │ 做题界面  │ │ 成就页面  │ │ 能力雷达  │    │
│  └────┬────┘ └────┬────┘ └────┬────┘ └─────┬────┘    │
│       └───────────┴───────────┴────────────┘          │
│                        │ API                           │
├────────────────────────┼───────────────────────────────┤
│                  后端 API                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐    │
│  │出题引擎  │ │批改引擎  │ │讲解引擎  │ │数据分析  │    │
│  └────┬────┘ └────┬────┘ └────┬────┘ └─────┬────┘    │
│       └───────────┴───────────┴────────────┘          │
│                        │                               │
├────────────────────────┼───────────────────────────────┤
│                   AI 层                                 │
│            Claude API（或等效LLM）                       │
│                        │                               │
├────────────────────────┼───────────────────────────────┤
│                   数据层                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │用户/进度  │ │ 错题本    │ │ 成就/等级 │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└────────────────────────────────────────────────────────┘
```

### 2.2 技术选型

| 层 | 技术 | 理由 |
|----|------|------|
| **前端** | Next.js (React) | SSR + SPA 一体，部署简单 |
| **样式** | Tailwind CSS | 快速原型，儿童友好配色 |
| **后端** | Next.js API Routes | 前后端同仓库，开发效率高 |
| **数据库** | SQLite (Turso / better-sqlite3) | 轻量，无需额外服务 |
| **AI** | Claude API (Anthropic SDK) | 强教育能力，中文理解优秀 |
| **语音** | Web Speech API | 浏览器原生，无需额外依赖 |
| **部署** | Vercel | Next.js 最佳搭档，免费额度够用 |

### 2.3 文件结构

```
/
├── app/                    # Next.js App Router
│   ├── page.jsx           # 主界面（科目选择）
│   ├── layout.jsx         # 全局布局
│   ├── yuven/             # 语文
│   │   └── page.jsx
│   ├── math/              # 数学
│   │   └── page.jsx
│   ├── english/           # 英语
│   │   └── page.jsx
│   ├── achievement/       # 成就页面
│   │   └── page.jsx
│   └── api/               # API 路由
│       ├── question/      # 出题
│       ├── evaluate/      # 批改
│       ├── explain/       # 讲解
│       └── progress/      # 进度数据
│
├── lib/
│   ├── ai.js             # AI 调用封装
│   ├── db.js             # 数据库操作
│   └── prompts/          # AI 提示词
│       ├── math.js
│       ├── yuven.js
│       └── english.js
│
├── components/
│   ├── QuestionCard.jsx  # 题目卡片
│   ├── ProgressBar.jsx   # 进度条
│   ├── Achievement.jsx   # 成就徽章
│   └── RadarChart.jsx    # 能力雷达图
│
├── data/
│   └── schema.sql        # 数据库建表
│
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-30-learning-system-design.md
```

---

## 三、AI 引擎详细设计

### 3.1 出题引擎

每次用户请求一道题，AI 根据以下参数生成：

```javascript
// 请求参数
{
  subject: "math",               // 科目
  grade: "grade2",               // 年级
  difficulty: "medium",          // 难度 (easy/medium/hard/challenge)
  knowledge_point: "万以内减法",  // 当前知识点
  question_type: "choice",       // 题型 (choice/fill/calculation)
  history: "上次做错数位混淆",    // 历史记录
  novelty: "生活情境"            // 新意要求
}
```

**题型支持**：
| 题型 | 适用科目 | 交互方式 |
|------|---------|---------|
| 选择题（4选1） | 全部 | 点击选项 |
| 填空题 | 数学/语文 | 输入数字/文字 |
| 判断题 | 全部 | 点 ✓/✗ |
| 口算题 | 数学 | 输入答案 |
| 连线题 | 英语/语文 | 拖拽匹配 |
| 排序题 | 语文/英语 | 拖动排序 |

### 3.2 批改引擎

AI 即时评判答案，返回：

```javascript
{
  correct: true/false,
  score: 100,
  explanation: "讲解内容...",
  // 如果做错：
  mistake_type: "粗心/概念不清/审题错误",
  similar_question: "同类变式题（AI生成）"
}
```

### 3.3 自适应难度算法

```
一轮10题结束后评估：

正确率 ≥ 85%  → 难度+1 或 下一知识点
正确率 60-85% → 保持当前
正确率 < 60%  → 难度-1 或 回退到前置知识点

连续3轮都 ≥ 85% → 自动尝试超前内容
连续3轮都 100%  → 进入竞赛思维模式
```

### 3.4 竞赛思维模式

当基础内容掌握度达到阈值后，切换为竞赛题模式：

```
竞赛题特征：
• 跨知识点综合题
• 需要2-3步推理
• 考察逻辑思维而非记忆
• 增加"推理过程"输入（不只要答案）
• 每题有"提示"按钮（可看1-2个提示）
```

---

## 四、交互与视觉设计

### 4.1 儿童友好原则
- 超大字/按钮（最小字号24px，按钮最小60px）
- 主色：暖色系（橙/蓝/绿），饱和度适中
- 大量 Emoji 和图标，减少纯文字导航
- 每页专注一件事，无复杂菜单
- 答对/答错有即时动画反馈（🎉飘落 / 😅抖动）

### 4.2 页面流

```
🏠 主界面（科目选择）
  │
  ├── 📖 语文进入 → 🤖 AI出题 → 答题 → 批改/讲解 → 🔄 下一题
  │                                    ↓
  │                                错误记入错题本
  │
  ├── 🔢 数学进入 → 🤖 AI出题 → 答题 → 批改/讲解 → 🔄 下一题
  │                                    ↓
  │                                错误记入错题本
  │
  ├── 🆎 英语进入 → 🤖 AI出题 → 答题 → 批改/讲解 → 🔄 下一题
  │                                    ↓
  │                                错误记入错题本
  │
  └── 🏆 成就页面 → 查看等级/徽章/学习报告
```

### 4.3 等级系统

```
🌱 小种子 → 🌿 小芽 → 🌻 小花 → 🌳 小树 → ⭐ 小明星 → 🏅 小学霸

每科目独立等级，经验值 = 答题数量 × 正确率加成
```

### 4.4 成就徽章

| 徽章 | 解锁条件 |
|------|---------|
| 🏅 计算小能手 | 数学连对10题 |
| 🏅 单词大王 | 英语单词题全对一轮 |
| 🏅 坚持不懈 | 连续学习7天 |
| 🏅 闪电侠 | 10秒内答对 |
| 🏅 越挫越勇 | 同一错题第三次做对 |
| 🏅 小博士 | 完成一个年级的全部知识点 |
| 🏅 闯关达人 | 超前学习一个年级 |

### 4.5 新意机制

```
每日首次登录 → 随机一句鼓励语（AI生成）
连击3天以上 → "🔥 连击N天" 横幅
升级 → 全屏彩花动画 🎊
获得成就 → 徽章弹出 + 音效
每周末 → "本周学习报告"（AI总结）
```

---

## 五、数据模型

### 5.1 核心表

```sql
-- 用户
CREATE TABLE users (
  id TEXT PRIMARY KEY,          -- 浏览器 localStorage ID
  name TEXT DEFAULT '小朋友',
  created_at TEXT
);

-- 学习记录
CREATE TABLE learning_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  subject TEXT,                 -- math/yuven/english
  question TEXT,                -- 题目原文
  options TEXT,                 -- 选项（JSON）
  answer TEXT,                  -- 正确答案
  user_answer TEXT,             -- 用户答案
  correct BOOLEAN,
  difficulty TEXT,              -- easy/medium/hard/challenge
  knowledge_point TEXT,
  mistake_type TEXT,            -- 错误类型
  time_spent INTEGER,           -- 用时(秒)
  created_at TEXT
);

-- 错题本
CREATE TABLE error_book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  subject TEXT,
  question TEXT,
  options TEXT,
  answer TEXT,
  user_answer TEXT,
  knowledge_point TEXT,
  mistake_type TEXT,
  retry_count INTEGER DEFAULT 0,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TEXT,
  mastered_at TEXT
);

-- 用户进度
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  subject TEXT,
  current_level INTEGER DEFAULT 1,    -- 1=二上, 2=二下, 3=三上...
  experience INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,      -- 连续学习天数
  last_study_date TEXT
);

-- 成就
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  badge_id TEXT,
  unlocked_at TEXT
);
```

---

## 六、实施路线图

### 第一阶段：MVP（1-2周）
- [ ] 项目脚手架（Next.js + Tailwind + 数据库）
- [ ] 主界面（科目选择页）
- [ ] 数学 AI 出题 + 批改 + 讲解
- [ ] 基础等级系统

### 第二阶段：完整学科（2-3周）
- [ ] 语文 AI 出题
- [ ] 英语 AI 出题
- [ ] 错题本功能
- [ ] 自适应难度调整

### 第三阶段：新意系统（1-2周）
- [ ] 成就徽章
- [ ] 升级动画
- [ ] 能力雷达图
- [ ] 语音朗读

### 第四阶段：进阶（2-3周）
- [ ] 竞赛思维模式
- [ ] 每周学习报告
- [ ] 超前学习路径优化
- [ ] 家长看板（可选）

---

## 七、风险与对策

| 风险 | 概率 | 影响 | 对策 |
|------|------|------|------|
| AI 出题偶尔不准确 | 中 | 中 | 设计好 Prompt + 人工审核机制 |
| API 调用延迟影响体验 | 中 | 高 | 加 loading 动画，预缓存常用题目 |
| 弟弟觉得无聊 | 低 | 高 | 新意机制持续迭代，听取反馈 |
| 网络不稳定 | 低 | 中 | 前端缓存+离线提示 |
| AI 费用超支 | 中 | 中 | 设置月额度上限，缓存复用 |

---

*设计规范版本 v1.0 — 2026-06-30*
