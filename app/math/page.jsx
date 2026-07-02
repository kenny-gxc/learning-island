'use client';

import { useState, useCallback, useEffect } from 'react';
import { getUserId, getUserName, isLoggedIn, logout } from '@/lib/user';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';
import Confetti from '@/components/Confetti';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function MathPage() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [stats, setStats] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [round, setRound] = useState(1);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const userId = typeof window !== 'undefined' ? getUserId() : '';

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) { router.push('/login'); return; }
  }, [router]);

  const loadQuestion = useCallback(async () => {
    setLoading(true); setResult(null); setQuestion(null); setLastAnswer(null);
    try {
      const res = await fetch('/api/question', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'math', difficulty: 'easy' }),
      });
      const data = await res.json();
      if (data.success) setQuestion({ ...data.question, answer: data.answer });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isLoggedIn()) loadQuestion(); }, [loadQuestion]);

  const handleAnswer = async (userAnswer) => {
    if (evaluating || !question) return;
    setEvaluating(true);
    setLastAnswer(userAnswer);
    const startTime = Date.now();
    try {
      await new Promise(r => setTimeout(r, 500));
      const res = await fetch('/api/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, subject: 'math', question, userAnswer,
          timeSpent: Math.round((Date.now() - startTime) / 1000),
        }),
      });
      const data = await res.json();
      setResult(data); setStats(data.stats);
      if (data.correct) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }
    } catch (e) { console.error(e); }
    finally { setEvaluating(false); }
  };

  if (!mounted || !isLoggedIn()) return null;

  return (
    <div className="space-y-4">
      <Confetti active={showConfetti} />
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl hover:opacity-70">⬅️</Link>
        <div className="text-center">
          <h1 className="text-kid-2xl font-bold">🔢 数学小天地</h1>
          <div className="text-sm text-gray-400">👋 {getUserName()} · 第 {round} 题</div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-kid-pink transition-colors">🔄</button>
      </div>

      {!result && (loading ? <LoadingSpinner /> : (
        <QuestionCard question={question} onAnswer={handleAnswer} loading={evaluating} />
      ))}

      {result && (
        <div className={`card-kid text-center space-y-4 animate-bounce-in ${result.correct ? 'border-kid-green' : 'border-kid-pink'}`}>
          <div className="text-6xl">{result.correct ? '🎉' : '😅'}</div>
          <div className="text-kid-2xl font-bold">{result.correct ? '答对了！太棒了！' : '哎呀，再想想...'}</div>
          <div className="bg-gray-50 rounded-2xl p-4 text-left text-lg leading-relaxed">
            <div className="font-bold mb-2">📖 老师讲解</div>{result.explanation}
          </div>
          {!result.correct && (
            <div className="text-lg text-gray-500">
              你的答案: <span className="line-through font-bold text-kid-pink">{lastAnswer}</span>
              <span className="ml-3 text-kid-green font-bold">正确答案: {question?.answer}</span>
            </div>
          )}
          <div className="text-lg text-kid-blue">{result.encouragement}</div>
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <span>✨ +{result.experience} 经验</span>
            {result.level && <span>等级: {result.level.title}</span>}
          </div>
          {result.newAchievements?.length > 0 && (
            <div className="bg-yellow-50 rounded-2xl p-3">
              <div className="text-2xl">🏆 获得新成就!</div>
              {result.newAchievements.map((a, i) => <div key={i} className="text-xl font-bold text-yellow-600">{a.title}</div>)}
            </div>
          )}
          <button onClick={() => { setRound(r => r + 1); loadQuestion(); }} className="btn-kid-primary text-kid-xl px-12">
            ➡️ 下一题
          </button>
        </div>
      )}
    </div>
  );
}
