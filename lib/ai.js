const { buildMathPrompt } = require('./prompts/math');
const { buildYuvenPrompt } = require('./prompts/yuven');
const { buildEnglishPrompt } = require('./prompts/english');

const PROMPT_BUILDERS = {
  math: buildMathPrompt,
  yuven: buildYuvenPrompt,
  english: buildEnglishPrompt,
};

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-v4-flash';

// 去掉选项中的 "A." "B." 等前缀
function cleanOption(text) {
  return String(text).replace(/^[A-Da-d][.、)\s]\s*/, '').trim();
}

// 清洗 AI 返回的题目，统一格式
function sanitizeQuestion(q) {
  if (!q) return q;

  // 清洗选项
  if (q.options && Array.isArray(q.options)) {
    q.options = q.options.map(cleanOption);
  }

  // 清洗 answer：如果是选择题答案包含"A." "B." 只保留字母
  if (q.type === 'choice' && q.answer) {
    const match = String(q.answer).match(/^([A-Da-d])/);
    if (match) q.answer = match[1].toUpperCase();
  }

  return q;
}

async function callDeepSeek(systemPrompt, userMessage, maxTokens = 1024) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY 未设置，请在 .env.local 中配置');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 错误 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateQuestion(subject, params = {}) {
  const builder = PROMPT_BUILDERS[subject];
  if (!builder) throw new Error(`不支持的科目: ${subject}`);

  const { system, user } = builder({
    difficulty: params.difficulty || 'medium',
    knowledgePoint: params.knowledgePoint || '',
    history: params.history || '',
    questionType: params.questionType || 'auto',
  });

  const text = await callDeepSeek(system, user, 1024);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI 返回格式错误');
    return sanitizeQuestion(JSON.parse(jsonMatch[0]));
  } catch (e) {
    console.error('AI JSON 解析失败:', text);
    return {
      question: '😅 基础题',
      questionText: '2 + 3 = ?',
      type: 'calculation',
      options: [],
      answer: '5',
      difficulty: 'easy',
      knowledgePoint: '加法',
      explanation: '2 + 3 等于多少呢？我们数一数：1、2、3、4、5！答案是 5。',
      hint: '用手指头数一数吧！',
    };
  }
}

async function evaluateAnswer(question, userAnswer) {
  const systemPrompt = `你是一位亲切的二年级老师。判断学生的答案是否正确，用孩子能懂的语言给出反馈。
如果做错了，分析错误类型（"粗心"、"概念不清"、"审题错误"），并给出简短讲解。
返回格式:
{
  "correct": true/false,
  "score": 100,
  "explanation": "讲解内容（30-50字，儿童语言）",
  "mistakeType": "粗心 | 概念不清 | 审题错误 | 正确",
  "encouragement": "一句鼓励的话"
}`;

  const userMessage = `题目：${question.questionText}\n正确答案：${question.answer}\n学生的答案：${userAnswer}\n请判断是否正确并给出反馈。`;

  try {
    const text = await callDeepSeek(systemPrompt, userMessage, 512);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('批改解析失败:', e);
  }

  // AI 失败时的兜底：严格字符串对比
  const isCorrect = String(userAnswer).trim() === String(question.answer).trim();
  return {
    correct: isCorrect,
    score: isCorrect ? 100 : 0,
    explanation: isCorrect ? '太棒了！回答正确！👏' : '哎呀，答案是 ' + question.answer + ' 哦！🤔',
    mistakeType: isCorrect ? '正确' : '粗心',
    encouragement: isCorrect ? '你真聪明！继续保持！🌟' : '没关系，下次加油！💪',
  };
}

module.exports = { generateQuestion, evaluateAnswer };
