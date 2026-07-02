'use client';

import { useState, useCallback, useEffect } from 'react';
import { getUserId, getUserName, isLoggedIn, logout } from '@/lib/user';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';
import Confetti from '@/components/Confetti';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function YuvenPage() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
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
    setLoading(true); setResult(null); setQuestion(null);
    try {
      const res = await fetch('/api/question', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'yuven', difficulty: 'easy' }),
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
    try {
      await new Promise(r => setTimeout(r, 500));
      const res = await fetch('/api/evaluate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subject: 'yuven', question, userAnswer, timeSpent: 0 }),
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
          <h1 className="text-kid-2xl font-bold">📖 语文乐园</h1>
          <div className="text-sm text-gray-400">👋 {getUserName()} · 第 {round} 题</div>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-kid-pink transition-colors">🔄</button>
      </div>
      {!result && (loading ? <LoadingSpinner message="📖 正在准备语文题..." /> : <QuestionCard question={question} onAnswer={handleAnswer} loading={evaluating} />)}
      {result && (
        <div className={`card-kid text-center space-y-4 animate-bounce-in ${result.correct ? 'border-kid-green' : 'border-kid-pink'}`}>
          <div className="text-6xl">{result.correct ? '🎉' : '😅'}</div>
          <div className="text-kid-2xl font-bold">{result.correct ? '答对了！' : '再想想哦～'}</div>
          <div className="bg-gray-50 rounded-2xl p-4 text-left text-lg leading-relaxed">
            <div className="font-bold mb-2">📖 老师讲解</div>{result.explanation}
          </div>
          <div className="text-lg text-kid-blue">{result.encouragement}</div>
          <button onClick={() => { setRound(r => r + 1); loadQuestion(); }} className="btn-kid-primary text-kid-xl px-12">➡️ 下一题</button>
        </div>
      )}
    </div>
  );
}
