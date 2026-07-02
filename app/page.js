'use client';

import { useState, useEffect } from 'react';
import { getUserId, getUserName, isLoggedIn, logout } from '@/lib/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SUBJECTS = [
  { id: 'math', name: '数学', emoji: '🔢', desc: '加减乘除，脑力全开！' },
  { id: 'yuven', name: '语文', emoji: '📖', desc: '识字阅读，妙笔生花！' },
  { id: 'english', name: '英语', emoji: '🆎', desc: 'ABC，世界那么大！' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) { router.push('/login'); return; }

    const userId = getUserId();
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // 首次渲染统一返回 null，避免 SSR 与客户端 hydration 不匹配
  if (!mounted || !isLoggedIn()) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-kid-blue">
          👋 {getUserName() || '小朋友'}
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-kid-pink transition-colors">
          切换用户 🔄
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-kid-3xl font-bold mb-2">🌟 我的学习小岛</h1>
        <p className="text-lg text-gray-500">今天也要加油哦！💪</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBJECTS.map(subject => {
          const subjectStats = stats?.[subject.id];
          return (
            <Link
              key={subject.id}
              href={`/${subject.id}`}
              className="card-kid hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block text-center"
            >
              <div className="emoji-xl mb-3">{subject.emoji}</div>
              <h2 className="text-kid-2xl font-bold mb-2">{subject.name}</h2>
              <p className="text-gray-500 mb-3">{subject.desc}</p>
              {loading ? (
                <div className="text-gray-300 animate-pulse">加载中...</div>
              ) : subjectStats ? (
                <div className="space-y-2">
                  <div className="text-xl">{subjectStats.level?.title || '🌱 小种子'}</div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-kid-orange to-kid-yellow h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subjectStats.totalQuestions / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    {subjectStats.totalQuestions} 题 · 正确率 {subjectStats.correctRate}%
                  </div>
                </div>
              ) : (
                <div className="text-gray-300">还没开始学习呢 🫣</div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Link href="/achievement" className="btn-kid-primary flex items-center gap-2">🏆 成就</Link>
      </div>
    </div>
  );
}
