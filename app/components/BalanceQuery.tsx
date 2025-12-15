'use client';

import { useState } from 'react';
import { supabase, type ApiKeyPool } from '@/lib/supabase';

export interface BalanceResult {
  apiKey: string;
  provider: string;
  balance?: number;
  total?: number;
  used?: number;
  currency?: string;
  error?: string;
  status: 'success' | 'error' | 'loading';
  details?: unknown;
}

interface BalanceQueryProps {
  selectedProvider: string;
}

export default function BalanceQuery({ selectedProvider }: BalanceQueryProps) {
  const [apiKeysInput, setApiKeysInput] = useState('');
  const [results, setResults] = useState<BalanceResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const parseApiKeys = (input: string): string[] => {
    // 支持换行符或逗号分隔
    return input
      .split(/[\n,]+/)
      .map(key => key.trim())
      .filter(key => key.length > 0);
  };

  const checkBalance = async (apiKey: string, provider: string): Promise<BalanceResult> => {
    try {
      const response = await fetch('/api/check-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          apiKey,
          provider,
          error: data.error || '查询失败',
          status: 'error',
        };
      }

      return {
        apiKey,
        provider,
        ...data,
        status: 'success',
      };
    } catch (error) {
      return {
        apiKey,
        provider,
        error: error instanceof Error ? error.message : '网络错误',
        status: 'error',
      };
    }
  };

  const handleQuery = async () => {
    const keys = parseApiKeys(apiKeysInput);
    
    if (keys.length === 0) {
      alert('请输入至少一个 API Key');
      return;
    }
    
    setIsChecking(true);
    setResults(keys.map(key => ({
      apiKey: key,
      provider: selectedProvider,
      status: 'loading' as const,
    })));

    const promises = keys.map(key => checkBalance(key, selectedProvider));
    const allResults = await Promise.all(promises);
    
    setResults(allResults);
    setIsChecking(false);
  };

  const getProviderLabel = (provider: string) => {
    const providers = [
      { value: 'deepseek', label: 'DeepSeek' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'volcengine', label: '字节火山' },
      { value: 'qwen', label: '阿里千问' },
      { value: 'siliconflow', label: '硅基流动' },
    ];
    return providers.find(p => p.value === provider)?.label || provider;
  };

  const handleCopyApiKey = async (apiKey: string, index: number) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleCopyAllValidKeys = async () => {
    const validKeys = results
      .filter(r => r.status === 'success')
      .map(r => r.apiKey);
    
    if (validKeys.length === 0) {
      alert('没有可用的 API Key');
      return;
    }

    try {
      await navigator.clipboard.writeText(validKeys.join('\n'));
      alert(`已复制 ${validKeys.length} 个可用的 API Key`);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请重试');
    }
  };

  const handleSaveAllToDatabase = async () => {
    const validResults = results.filter(r => r.status === 'success');
    
    if (validResults.length === 0) {
      alert('没有可用的 API Key 可以保存');
      return;
    }

    setIsChecking(true);
    try {
      const insertData: Omit<ApiKeyPool, 'id' | 'created_at'>[] = validResults.map(result => ({
        llm: result.provider,
        key: result.apiKey,
        balance: result.balance,
        currency: result.currency,
        description: undefined,
      }));

      const { error } = await supabase
        .from('api-key-pool')
        .insert(insertData);

      if (error) {
        console.error('保存失败:', error);
        alert('保存失败：' + error.message);
        return;
      }

      alert(`成功保存 ${validResults.length} 个 API Key 到数据库`);
    } catch (err) {
      console.error('保存异常:', err);
      alert('保存失败，请重试');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      {/* API Key 输入框 */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
          输入 API Keys
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            （支持多个，一行一个或逗号分隔）
          </span>
        </label>
        <textarea
          value={apiKeysInput}
          onChange={(e) => setApiKeysInput(e.target.value)}
          placeholder="sk-xxxxxxxxxxxxx&#10;sk-yyyyyyyyyyyyy&#10;或使用逗号分隔: sk-xxx, sk-yyy"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm resize-none"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' }}
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          已输入 {parseApiKeys(apiKeysInput).length} 个 API Key
        </p>
      </div>

      {/* 查询按钮 */}
      <div className="mb-6">
        <button
          onClick={handleQuery}
          disabled={isChecking || apiKeysInput.trim() === ''}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
        >
          {isChecking ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              查询中...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              查询余额
            </>
          )}
        </button>
      </div>

      {/* 查询结果列表 */}
      {results.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                查询结果 ({results.length})
              </h2>
              {results.filter(r => r.status === 'success').length > 0 && (
                <>
                  <button
                    onClick={handleCopyAllValidKeys}
                    className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white text-xs cursor-pointer font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                    title="复制所有查询成功的 API Key"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    一键复制所有可用API
                  </button>
                  <button
                    onClick={handleSaveAllToDatabase}
                    disabled={isChecking}
                    className="px-2 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-xs cursor-pointer font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                    title="保存所有查询成功的 API Key 到数据库"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    一键保存到数据库
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                成功: {results.filter(r => r.status === 'success').length}
              </span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                失败: {results.filter(r => r.status === 'error').length}
              </span>
              {results.some(r => r.status === 'loading') && (
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  查询中: {results.filter(r => r.status === 'loading').length}
                </span>
              )}
            </div>
          </div>
        
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* API Key 显示 */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                        {getProviderLabel(result.provider)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">
                        {result.apiKey.slice(0, 12)}...{result.apiKey.slice(-8)}
                      </span>
                      <button
                        onClick={() => handleCopyApiKey(result.apiKey, index)}
                        className="p-1.5 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="复制完整 API Key"
                      >
                        {copiedIndex === index ? (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* 查询状态 */}
                    {result.status === 'loading' && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        查询中...
                      </div>
                    )}

                    {/* 错误状态 */}
                    {result.status === 'error' && (
                      <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{result.error}</span>
                      </div>
                    )}

                    {/* 成功状态 */}
                    {result.status === 'success' && (
                      <div className="space-y-2">
                        {result.balance !== undefined && (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                              余额: {Number(result.balance).toFixed(4)} {result.currency || 'USD'}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {result.total !== undefined && (
                            <div className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">总额度:</span> {Number(result.total).toFixed(4)} {result.currency || 'USD'}
                            </div>
                          )}
                          {result.used !== undefined && (
                            <div className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">已使用:</span> {Number(result.used).toFixed(4)} {result.currency || 'USD'}
                            </div>
                          )}
                        </div>
                        {result.details && (
                          <details className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                              查看详细信息
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
