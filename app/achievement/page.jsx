'use client';

import { useState, useEffect } from 'react';
import { getUserId, getUserName, isLoggedIn, logout } from '@/lib/user';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ALL_BADGES = [
  { id: 'math-streak-10', title: '🏅 计算小能手', desc: '数学连对10题', condition: '数学连对10题' },
  { id: 'eng-word-master', title: '🏅 单词大王', desc: '英语题全对一轮', condition: '英语单词题全部答对' },
  { id: 'streak-7', title: '🏅 坚持不懈', desc: '连续学习7天', condition: '连续7天每天学习' },
  { id: 'speed-demon', title: '🏅 闪电侠', desc: '10秒内答对', condition: '10秒内答对题目' },
  { id: 'never-give-up', title: '🏅 越挫越勇', desc: '错题第三次做对', condition: '同一错题第三次终于做对' },
  { id: 'little-doctor', title: '🏅 小博士', desc: '完成全部知识点', condition: '完成一个年级的所有知识点' },
  { id: 'pioneer', title: '🏅 闯关达人', desc: '超前学习一个年级', condition: '超前学习一个年级的内容' },
];

const levelMilestones = [
  { exp: 0, title: '🌱 小种子' },
  { exp: 25, title: '🌿 小芽' },
  { exp: 70, title: '🌻 小花' },
  { exp: 150, title: '🌳 小树' },
  { exp: 300, title: '⭐ 小明星' },
  { exp: 500, title: '🏅 小学霸' },
];

export default function AchievementPage() {
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) { router.push('/login'); return; }

    const userId = getUserId();
    fetch('/api/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setStats(data.stats); setBadges(data.achievements || []); }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (!mounted || !isLoggedIn()) return null;

  const totalExp = stats ? Object.values(stats).reduce((s, v) => s + (v.experience || 0), 0) : 0;
  const currentLevel = [...levelMilestones].reverse().find(l => totalExp >= l.exp) || levelMilestones[0];
  const nextLevel = levelMilestones.find(l => l.exp > totalExp) || levelMilestones[levelMilestones.length - 1];
  const expProgress = nextLevel.exp > 0 ? (totalExp / nextLevel.exp) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl hover:opacity-70">⬅️</Link>
        <h1 className="text-kid-3xl font-bold">🏆 我的成就</h1>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-kid-pink transition-colors">🔄</button>
      </div>

      <div className="text-center text-sm text-gray-400">👋 {getUserName()}</div>

      <div className="card-kid text-center space-y-3">
        <div className="text-6xl">{currentLevel.title.split(' ')[0]}</div>
        <div className="text-kid-2xl font-bold">{currentLevel.title}</div>
        <div className="bg-gray-100 rounded-full h-4 overflow-hidden mx-auto max-w-xs">
          <div className="bg-gradient-to-r from-kid-yellow to-kid-orange h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, expProgress)}%` }} />
        </div>
        <div className="text-sm text-gray-400">
          {totalExp} / {nextLevel.exp} 经验值
          {nextLevel !== levelMilestones[levelMilestones.length - 1] && <span> · 下一个: {nextLevel.title}</span>}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="card-kid text-center py-4">
              <div className="text-2xl mb-2">{key === 'math' ? '🔢' : key === 'yuven' ? '📖' : '🆎'}</div>
              <div className="font-bold">{val.level?.title || '🌱'}</div>
              <div className="text-sm text-gray-400">{val.totalQuestions || 0} 题</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-kid-2xl font-bold">🎖️ 徽章墙</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ALL_BADGES.map(badge => {
          const unlocked = badges.includes(badge.id);
          return (
            <div key={badge.id} className={`card-kid text-center py-4 transition-all ${unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              <div className="text-3xl mb-2">{unlocked ? badge.title.split(' ')[0] : '🔒'}</div>
              <div className="font-bold text-sm">{badge.title}</div>
              <div className="text-xs text-gray-400 mt-1">{unlocked ? '✅ 已解锁' : badge.condition}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
