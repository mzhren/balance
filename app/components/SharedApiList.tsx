'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, type ApiKeyPool } from '@/lib/supabase';

interface SharedApi {
  id: string;
  provider: string;
  apiKey: string;
  description: string;
  addedAt: string;
  balance?: number;
  currency?: string;
}

interface SharedApiListProps {
  selectedProvider: string;
}

export default function SharedApiList({ selectedProvider }: SharedApiListProps) {
  const [sharedApis, setSharedApis] = useState<SharedApi[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [newApi, setNewApi] = useState({
    provider: selectedProvider,
    apiKey: '',
    description: '',
    balance: '',
    currency: 'CNY',
  });

  // 检查 URL 参数中是否有 user=admin
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsAdmin(searchParams.get('user') === 'admin');
  }, []);

  // 当 selectedProvider 改变时，更新 newApi 的 provider
  useEffect(() => {
    setNewApi(prev => ({ ...prev, provider: selectedProvider }));
  }, [selectedProvider]);

  const providers = [
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'volcengine', label: '字节火山' },
    { value: 'qwen', label: '阿里千问' },
    { value: 'siliconflow', label: '硅基流动' },
  ];

  // 从 Supabase 获取 API 列表
  const fetchApis = useCallback(async () => {
    setIsLoading(true);
    try {
      // 获取总数
      const { count } = await supabase
        .from('api-key-pool')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      // 获取当前页数据
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('api-key-pool')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('获取 API 列表失败:', error);
        alert('获取数据失败：' + error.message);
        return;
      }

      const mappedData: SharedApi[] = (data || []).map((row: ApiKeyPool) => ({
        id: row.id || '',
        provider: row.llm,
        apiKey: row.key,
        description: row.description || '',
        addedAt: row.created_at || new Date().toISOString(),
        balance: row.balance,
        currency: row.currency,
      }));

      setSharedApis(mappedData);
    } catch (err) {
      console.error('获取 API 列表异常:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchApis();
  }, [fetchApis]);

  const handleAddApi = async () => {
    if (!newApi.apiKey.trim()) {
      alert('请输入 API Key');
      return;
    }

    setIsLoading(true);
    try {
      const insertData: Omit<ApiKeyPool, 'id' | 'created_at'> = {
        llm: newApi.provider,
        key: newApi.apiKey,
        description: newApi.description || undefined,
        balance: newApi.balance ? Number(newApi.balance) : undefined,
        currency: newApi.currency || undefined,
      };

      const { error } = await supabase
        .from('api-key-pool')
        .insert([insertData]);

      if (error) {
        console.error('添加 API 失败:', error);
        alert('添加失败：' + error.message);
        return;
      }

      setNewApi({ provider: 'deepseek', apiKey: '', description: '', balance: '', currency: 'CNY' });
      setShowAddForm(false);
      setCurrentPage(1); // 重置到第一页
      await fetchApis();
    } catch (err) {
      console.error('添加 API 异常:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApi = async (id: string) => {
    if (!confirm('确定要删除这个 API Key 吗？')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('api-key-pool')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除 API 失败:', error);
        alert('删除失败：' + error.message);
        return;
      }

      await fetchApis();
    } catch (err) {
      console.error('删除 API 异常:', err);
    } finally {
      setIsLoading(false);
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
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        </div>
      )}

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  余额（可选）
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newApi.balance}
                  onChange={(e) => setNewApi({ ...newApi, balance: e.target.value })}
                  placeholder="100.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  币种
                </label>
                <select
                  value={newApi.currency}
                  onChange={(e) => setNewApi({ ...newApi, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                </select>
              </div>
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
            点击上方「添加 API」按钮来添加您的第一个共享 API Key
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
                  {(api.balance !== undefined || api.currency) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">余额:</span> {api.balance?.toFixed(2) || 'N/A'} {api.currency || 'CNY'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    添加时间: {new Date(api.addedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteApi(api.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页组件 */}
      {totalCount > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            共 {totalCount} 条记录，当前第 {currentPage} / {Math.ceil(totalCount / itemsPerPage)} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  // 显示当前页前后2页
                  return page === 1 || 
                         page === Math.ceil(totalCount / itemsPerPage) || 
                         Math.abs(page - currentPage) <= 2;
                })
                .map((page, index, array) => {
                  // 添加省略号
                  if (index > 0 && page - array[index - 1] > 1) {
                    return [
                      <span key={`ellipsis-${page}`} className="px-3 py-1.5 text-sm text-gray-400">...</span>,
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    ];
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1))}
              disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
