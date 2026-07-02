'use client';

import { useState, useEffect } from 'react';
import { setUser } from '@/lib/user';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        if (data.success) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (userName) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user.id, data.user.name);
        router.push('/');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (e) {
      setError('网络错误，请重试');
    }
    setSubmitting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    handleLogin(name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-kid max-w-md w-full space-y-6 text-center">
        <div className="text-6xl">🌟</div>
        <h1 className="text-kid-3xl font-bold">我的学习小岛</h1>
        <p className="text-gray-500">选一个名字开始学习吧！</p>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-2xl p-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="输入你的名字..."
            className="w-full p-4 text-center text-kid-2xl font-bold rounded-2xl border-4 border-gray-200 focus:border-kid-orange outline-none transition-all"
            maxLength={20} autoFocus />
          <button type="submit" disabled={submitting || !name.trim()}
            className="btn-kid-primary text-kid-2xl px-12 w-full disabled:opacity-50">
            {submitting ? '⏳ 进入中...' : '🚀 开始学习'}
          </button>
        </form>

        {users.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-3">或者选择已有用户：</p>
            <div className="flex flex-wrap justify-center gap-2">
              {users.map(u => (
                <button key={u.id} onClick={() => handleLogin(u.name)}
                  className="px-6 py-3 rounded-xl bg-gray-50 text-lg font-bold hover:bg-kid-orange hover:text-white transition-all">
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="text-gray-300 animate-pulse">加载中...</div>}
      </div>
    </div>
  );
}
