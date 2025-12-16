'use client';

import { useState } from 'react';
import BalanceQuery from './BalanceQuery';
import SharedApiList from './SharedApiList';

const PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'volcengine', label: '字节火山' },
  { value: 'qwen', label: '阿里千问' },
  { value: 'siliconflow', label: '硅基流动' },
];

// 模型平台选择组件
interface ProviderSelectorProps {
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
}

function ProviderSelector({ selectedProvider, onSelectProvider }: ProviderSelectorProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        选择模型平台
      </h2>
      <div className="flex flex-wrap gap-3">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.value}
            onClick={() => onSelectProvider(provider.value)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedProvider === provider.value
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BalanceChecker() {
  const [selectedProvider, setSelectedProvider] = useState('deepseek');
  const [activeTab, setActiveTab] = useState<'balance' | 'shared'>('balance');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Tab 选项卡 */}
      <div className="mb-8">
        <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 px-6 py-3 font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'balance'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              API余额查询
            </div>
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 px-6 py-3 font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'shared'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              共享API列表
            </div>
          </button>
        </div>

        {/* 模型平台选择 */}
        <ProviderSelector 
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
        />

        {/* Tab 内容 */}
        {activeTab === 'balance' ? (
          <BalanceQuery selectedProvider={selectedProvider} />
        ) : (
          <SharedApiList selectedProvider={selectedProvider} />
        )}
      </div>
    </div>
  );
}
