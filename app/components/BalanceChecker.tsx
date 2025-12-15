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
      <div className="mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'balance'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            API余额查询
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'shared'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            共享API列表
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
