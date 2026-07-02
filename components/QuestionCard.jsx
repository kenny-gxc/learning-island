'use client';

import { useState } from 'react';

// 去掉 AI 返回的 "A." "A、" "A)" 等前缀
function cleanOption(text) {
  return text.replace(/^[A-Da-d][.、)\s]\s*/, '');
}

export default function QuestionCard({ question, onAnswer, loading }) {
  const [selected, setSelected] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (loading) return;
    if (question?.type === 'choice') {
      if (!selected) return;
      onAnswer(selected);
    } else {
      if (!inputValue && inputValue !== 0) return;
      onAnswer(inputValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  if (!question) return null;

  return (
    <div className="card-kid space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-2">{question.question}</div>
        <div className="text-kid-xl font-bold leading-relaxed">{question.questionText}</div>
      </div>

      {question.hint && (
        <div className="text-center">
          <button onClick={() => setShowHint(!showHint)} className="text-sm text-kid-blue hover:underline">
            💡 {showHint ? '收起提示' : '我想不出来...'}
          </button>
          {showHint && <div className="mt-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">{question.hint}</div>}
        </div>
      )}

      {question.type === 'choice' && question.options?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return (
              <button key={idx}
                onClick={() => setSelected(letter)}
                className={`p-4 rounded-2xl text-kid-xl font-bold transition-all
                  ${selected === letter ? 'bg-kid-orange text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="mr-2">{letter}.</span>{cleanOption(opt)}
              </button>
            );
          })}
        </div>
      )}

      {question.type !== 'choice' && (
        <div className="text-center">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown} placeholder="在这里输入答案..."
            className="w-48 p-4 text-center text-kid-2xl font-bold rounded-2xl border-4 border-gray-200 focus:border-kid-orange outline-none transition-all" autoFocus />
        </div>
      )}

      <div className="text-center">
        <button onClick={handleSubmit}
          disabled={loading || (question.type === 'choice' ? !selected : !inputValue && inputValue !== 0)}
          className="btn-kid-primary text-kid-2xl px-12 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? '⏳ 检查中...' : '✅ 提交'}
        </button>
      </div>
    </div>
  );
}
