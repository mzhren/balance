'use client';

import BalanceChecker from './components/BalanceChecker';
import BackgroundIcons from './components/BackgroundIcons';


export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 relative overflow-hidden">
      {/* 背景装饰图标 */}
      <BackgroundIcons />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            大模型 API 余额查询
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            支持多个平台批量查询余额
          </p>
        </div>
        <BalanceChecker />
      </div>
    </div>
  );
}

