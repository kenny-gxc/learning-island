import './globals.css';

export const metadata = {
  title: '🌟 我的学习小岛',
  description: '全科 AI 自适应学习系统',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '学习小岛',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': '学习小岛',
    'theme-color': '#FF6B35',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <main className="max-w-4xl mx-auto px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
