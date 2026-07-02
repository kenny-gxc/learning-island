export default function LoadingSpinner({ message = '🤔 正在出题...' }) {
  return (
    <div className="card-kid text-center py-16 space-y-4">
      <div className="text-6xl animate-bounce">📚</div>
      <div className="text-kid-xl text-gray-400 animate-pulse">{message}</div>
    </div>
  );
}
