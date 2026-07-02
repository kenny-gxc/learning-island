'use client';

import { useEffect, useState } from 'react';

const EMOJIS = ['🎉', '🌟', '⭐', '✨', '🎊', '💫', '🌈', '🏆'];

export default function Confetti({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 100, delay: Math.random() * 0.5, duration: 1 + Math.random() * 1.5,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <div key={p.id} className="absolute text-2xl"
          style={{
            left: `${p.left}%`, top: '-20px',
            animation: `confetti-fall ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
