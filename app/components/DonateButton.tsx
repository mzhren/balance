'use client';

import { useState, useEffect } from 'react';

export default function DonateButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 监听滚动，控制按钮显示
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsVisible(window.scrollY > 200);
  //   };

  //   window.addEventListener('scroll', handleScroll, { passive: true });
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <>
      {/* 赞赏按钮 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-3 cursor-pointer rounded-full bg-pink-500 text-white shadow-lg hover:bg-pink-600 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="赞赏支持"
        title="赞赏支持"
      >
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      {/* Modal 窗口 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
              aria-label="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal 内容 */}
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ❤️ 赞赏支持
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  如果您觉得这个网站对您有帮助，可以请我喝杯咖啡 ☕
                </p>
              </div>

              {/* 二维码容器 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* 微信赞赏码 */}
                <div className="flex flex-col items-center p-6 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border-2 border-green-200 dark:border-green-700">
                  <div className="text-2xl mb-3">💚</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    微信赞赏
                  </h3>
                  <div className="w-48 h-48 bg-white rounded-lg shadow-md flex items-center justify-center mb-3 overflow-hidden">
                    {/* 替换为实际的微信收款码图片路径 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/qrcodes/wx.webp"
                      alt="微信赞赏码"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center p-4">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-sm text-gray-500">请添加微信收款码</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    打开微信扫一扫
                  </p>
                </div>

                {/* 支付宝收款码 */}
                <div className="flex flex-col items-center p-6 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                  <div className="text-2xl mb-3">💙</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    支付宝赞赏
                  </h3>
                  <div className="w-48 h-48 bg-white rounded-lg shadow-md flex items-center justify-center mb-3 overflow-hidden">
                    {/* 替换为实际的支付宝收款码图片路径 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/qrcodes/ali.webp"
                      alt="支付宝收款码"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center p-4">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-sm text-gray-500">请添加支付宝收款码</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    打开支付宝扫一扫
                  </p>
                </div>
              </div>

              {/* 感谢信息 */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  ✨ 您的支持是我持续更新的动力 ✨
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  感谢每一位支持者！
                </p>
              </div>

              {/* 关闭按钮 */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
