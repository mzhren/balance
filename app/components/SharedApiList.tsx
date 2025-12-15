'use client';

import { useState } from 'react';

interface SharedApi {
  id: string;
  provider: string;
  apiKey: string;
  description: string;
  addedAt: string;
  status: 'active' | 'inactive';
}

export default function SharedApiList() {
  const [sharedApis, setSharedApis] = useState<SharedApi[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApi, setNewApi] = useState({
    provider: 'deepseek',
    apiKey: '',
    description: '',
  });

  const providers = [
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'volcengine', label: '字节火山' },
    { value: 'qwen', label: '阿里千问' },
    { value: 'siliconflow', label: '硅基流动' },
  ];

  const handleAddApi = () => {
    if (!newApi.apiKey.trim()) {
      alert('请输入 API Key');
      return;
    }

    const api: SharedApi = {
      id: Date.now().toString(),
      provider: newApi.provider,
      apiKey: newApi.apiKey,
      description: newApi.description,
      addedAt: new Date().toISOString(),
      status: 'active',
    };

    setSharedApis([...sharedApis, api]);
    setNewApi({ provider: 'deepseek', apiKey: '', description: '' });
    setShowAddForm(false);
  };

  const handleDeleteApi = (id: string) => {
    if (confirm('确定要删除这个 API Key 吗？')) {
      setSharedApis(sharedApis.filter(api => api.id !== id));
    }
  };

  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      alert('API Key 已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const getProviderLabel = (value: string) => {
    return providers.find(p => p.value === value)?.label || value;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            共享 API 列表
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            管理和分享您的 API Keys
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加 API
        </button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            添加新的 API Key
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                选择平台
              </label>
              <select
                value={newApi.provider}
                onChange={(e) => setNewApi({ ...newApi, provider: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                {providers.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={newApi.apiKey}
                onChange={(e) => setNewApi({ ...newApi, apiKey: e.target.value })}
                placeholder="sk-xxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述（可选）
              </label>
              <input
                type="text"
                value={newApi.description}
                onChange={(e) => setNewApi({ ...newApi, description: e.target.value })}
                placeholder="用于测试环境"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddApi}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                确认添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API 列表 */}
      {sharedApis.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            暂无共享 API
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            点击上方"添加 API"按钮来添加您的第一个共享 API Key
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sharedApis.map((api) => (
            <div
              key={api.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {getProviderLabel(api.provider)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
                      {api.apiKey.slice(0, 12)}...{api.apiKey.slice(-8)}
                    </span>
                    <button
                      onClick={() => handleCopyApiKey(api.apiKey)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="复制完整 API Key"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  {api.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {api.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    添加时间: {new Date(api.addedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteApi(api.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="删除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
