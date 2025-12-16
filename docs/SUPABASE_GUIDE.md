# Supabase 使用指南

## 📋 目录
1. [项目概述](#项目概述)
2. [环境配置](#环境配置)
3. [客户端实例](#客户端实例)
4. [数据库结构](#数据库结构)
5. [常用操作](#常用操作)
6. [最佳实践](#最佳实践)
7. [注意事项](#注意事项)
8. [故障排查](#故障排查)

---

## 项目概述

本项目使用 Supabase 作为后端数据库服务，主要用于存储和管理 API Keys 的信息。

### 依赖包
```json
{
  "@supabase/supabase-js": "^2.87.1",  // 核心 SDK
  "@supabase/ssr": "^0.8.0"             // Next.js SSR 支持
}
```

---

## 环境配置

### 1. 环境变量设置

在项目根目录创建 `.env.local` 文件（**不要提交到 Git**）：

```env
# Supabase 项目 URL（必须以 http:// 或 https:// 开头）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase 匿名密钥（Anon Key）
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. 如何获取环境变量

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 重要提示

⚠️ **配置完成后必须重启开发服务器**

```bash
# 停止当前服务器（Ctrl + C）
# 重新启动
npm run dev
```

---

## 客户端实例

项目中有三个不同的 Supabase 客户端实例，用于不同场景：

### 1. 浏览器端客户端（推荐）

**位置**: `lib/supabase.ts`

**使用场景**: 
- ✅ Client Components（'use client'）
- ✅ 前端数据操作（增删改查）
- ✅ 无需 SSR 的场景

**特点**:
- 简单直接，开箱即用
- 自动处理环境变量校验
- 包含 TypeScript 类型定义

**导入方式**:
```typescript
import { supabase, type ApiKeyPool } from '@/lib/supabase';
```

**示例**:
```typescript
// 查询数据
const { data, error } = await supabase
  .from('api-key-pool')
  .select('*')
  .order('created_at', { ascending: false });

// 插入数据
const { error } = await supabase
  .from('api-key-pool')
  .insert([{ llm: 'openai', key: 'sk-xxx' }]);
```

### 2. 服务端客户端

**位置**: `app/utils/supabase/server.ts`

**使用场景**:
- ✅ Server Components
- ✅ API Routes
- ✅ Server Actions
- ✅ 需要服务端认证的场景

**特点**:
- 支持 Next.js 15+ 异步 cookies API
- 自动管理 cookie 会话
- 适用于认证用户操作

**导入方式**:
```typescript
import { createClient } from '@/app/utils/supabase/server';

// 必须 await
const supabase = await createClient();
```

### 3. 浏览器端 SSR 客户端

**位置**: `app/utils/supabase/client.ts`

**使用场景**:
- ⚠️ 特殊场景：需要 SSR 但在客户端组件中使用

**注意**: 此文件使用了错误的环境变量名 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`，应该修改为 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 数据库结构

### 表名: `api-key-pool`

| 字段名 | 类型 | 说明 | 必填 | 默认值 |
|--------|------|------|------|--------|
| `id` | `int8` | 主键，自动递增 | ✅ | auto |
| `created_at` | `timestamp` | 创建时间 | ✅ | now() |
| `llm` | `varchar` | 平台名称（如 deepseek, openai） | ✅ | - |
| `key` | `varchar` | API Key | ✅ | - |
| `balance` | `numeric` | 余额 | ❌ | null |
| `currency` | `varchar` | 币种（CNY, USD） | ❌ | null |
| `description` | `text` | 描述信息 | ❌ | null |

### TypeScript 接口定义

```typescript
export interface ApiKeyPool {
  id?: string;
  created_at?: string;
  llm: string;              // 必填
  key: string;              // 必填
  balance?: number;
  currency?: string;
  description?: string;
}
```

---

## 常用操作

### 1. 查询所有数据

```typescript
const { data, error } = await supabase
  .from('api-key-pool')
  .select('*')
  .order('created_at', { ascending: false });

if (error) {
  console.error('查询失败:', error);
  return;
}

console.log('查询成功:', data);
```

### 2. 分页查询

```typescript
const page = 1;
const itemsPerPage = 10;
const from = (page - 1) * itemsPerPage;
const to = from + itemsPerPage - 1;

// 获取总数
const { count } = await supabase
  .from('api-key-pool')
  .select('*', { count: 'exact', head: true });

// 获取当前页数据
const { data, error } = await supabase
  .from('api-key-pool')
  .select('*')
  .order('created_at', { ascending: false })
  .range(from, to);
```

### 3. 插入单条数据

```typescript
const insertData: Omit<ApiKeyPool, 'id' | 'created_at'> = {
  llm: 'deepseek',
  key: 'sk-xxxxxxxxxxxxx',
  description: '测试 API Key',
  balance: 100.50,
  currency: 'CNY',
};

const { error } = await supabase
  .from('api-key-pool')
  .insert([insertData]);

if (error) {
  console.error('插入失败:', error);
  return;
}

console.log('插入成功');
```

### 4. 批量插入（带重复检查）

```typescript
// 提取要保存的 keys
const keysToSave = ['sk-xxx', 'sk-yyy'];

// 检查已存在的 keys
const { data: existingData, error: checkError } = await supabase
  .from('api-key-pool')
  .select('key')
  .in('key', keysToSave);

if (checkError) {
  console.error('检查失败:', checkError);
  return;
}

// 过滤出不存在的 keys
const existingKeys = new Set(existingData?.map(item => item.key) || []);
const newKeys = keysToSave.filter(key => !existingKeys.has(key));

if (newKeys.length === 0) {
  console.log('所有 key 都已存在');
  return;
}

// 插入新数据
const insertData = newKeys.map(key => ({
  llm: 'deepseek',
  key: key,
  balance: 0,
  currency: 'CNY',
}));

const { error } = await supabase
  .from('api-key-pool')
  .insert(insertData);
```

### 5. 检查单个 Key 是否存在

```typescript
const apiKey = 'sk-xxxxxxxxxxxxx';

const { data, error } = await supabase
  .from('api-key-pool')
  .select('id')
  .eq('key', apiKey)
  .limit(1);

if (error) {
  console.error('检查失败:', error);
  return;
}

const exists = data && data.length > 0;
console.log('Key 是否存在:', exists);
```

### 6. 更新数据

```typescript
const { error } = await supabase
  .from('api-key-pool')
  .update({ 
    balance: 50.25,
    currency: 'USD' 
  })
  .eq('id', '123');

if (error) {
  console.error('更新失败:', error);
  return;
}

console.log('更新成功');
```

### 7. 删除数据

```typescript
const { error } = await supabase
  .from('api-key-pool')
  .delete()
  .eq('id', '123');

if (error) {
  console.error('删除失败:', error);
  return;
}

console.log('删除成功');
```

### 8. 条件查询

```typescript
// 单条件
const { data } = await supabase
  .from('api-key-pool')
  .select('*')
  .eq('llm', 'deepseek');

// 多条件
const { data } = await supabase
  .from('api-key-pool')
  .select('*')
  .eq('llm', 'deepseek')
  .gte('balance', 100);  // 余额 >= 100

// 模糊搜索
const { data } = await supabase
  .from('api-key-pool')
  .select('*')
  .ilike('key', '%sk-xxx%');
```

---

## 最佳实践

### 1. 错误处理

✅ **推荐做法**:
```typescript
const { data, error } = await supabase
  .from('api-key-pool')
  .select('*');

if (error) {
  console.error('操作失败:', error.message);
  alert('操作失败：' + error.message);
  return;
}

// 使用 data
console.log('成功:', data);
```

❌ **避免**:
```typescript
// 不检查错误，可能导致运行时错误
const { data } = await supabase.from('api-key-pool').select('*');
console.log(data.length); // data 可能是 null
```

### 2. 类型安全

✅ **使用 TypeScript 接口**:
```typescript
import { type ApiKeyPool } from '@/lib/supabase';

const insertData: Omit<ApiKeyPool, 'id' | 'created_at'> = {
  llm: 'deepseek',
  key: 'sk-xxx',
  // TypeScript 会确保类型正确
};
```

### 3. 数据校验

✅ **插入前校验**:
```typescript
// 校验必填字段
if (!newApi.apiKey.trim()) {
  alert('请输入 API Key');
  return;
}

// 校验格式
if (!newApi.apiKey.startsWith('sk-')) {
  alert('API Key 格式不正确');
  return;
}

// 检查重复
const { data: existingData } = await supabase
  .from('api-key-pool')
  .select('id')
  .eq('key', newApi.apiKey)
  .limit(1);

if (existingData && existingData.length > 0) {
  alert('该 API Key 已存在');
  return;
}
```

### 4. Loading 状态管理

✅ **提供用户反馈**:
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    const { error } = await supabase
      .from('api-key-pool')
      .insert([data]);
    
    if (error) throw error;
    
    alert('添加成功');
  } catch (error) {
    console.error(error);
    alert('添加失败');
  } finally {
    setIsLoading(false);
  }
};
```

### 5. 批量操作优化

✅ **使用 .in() 而非多次查询**:
```typescript
// ✅ 高效：一次查询
const { data } = await supabase
  .from('api-key-pool')
  .select('key')
  .in('key', ['sk-xxx', 'sk-yyy', 'sk-zzz']);

// ❌ 低效：多次查询
for (const key of keys) {
  const { data } = await supabase
    .from('api-key-pool')
    .select('key')
    .eq('key', key);
}
```

---

## 注意事项

### ⚠️ 1. Row Level Security (RLS)

**问题**: 插入或查询时报错 "new row violates row-level security policy"

**原因**: Supabase 默认启用 RLS，需要配置访问策略

**解决方案**:

#### 方案 A: 允许公开访问（适合公开数据）

```sql
-- 在 Supabase SQL Editor 中执行
-- 允许所有人查询
CREATE POLICY "Allow public read access" ON "api-key-pool"
  FOR SELECT
  USING (true);

-- 允许所有人插入
CREATE POLICY "Allow public insert access" ON "api-key-pool"
  FOR INSERT
  WITH CHECK (true);

-- 允许所有人更新
CREATE POLICY "Allow public update access" ON "api-key-pool"
  FOR UPDATE
  USING (true);

-- 允许所有人删除
CREATE POLICY "Allow public delete access" ON "api-key-pool"
  FOR DELETE
  USING (true);
```

#### 方案 B: 仅认证用户访问（推荐）

```sql
-- 仅允许认证用户操作
CREATE POLICY "Allow authenticated users" ON "api-key-pool"
  FOR ALL
  USING (auth.role() = 'authenticated');
```

#### 方案 C: 临时关闭 RLS（仅用于测试）

在 Supabase Dashboard:
1. 进入 **Database** → **Tables**
2. 选择 `api-key-pool` 表
3. 点击右上角 ⋮ → **Edit Table**
4. 关闭 **Enable Row Level Security (RLS)**

⚠️ **警告**: 生产环境中不推荐关闭 RLS

### ⚠️ 2. 环境变量名称错误

**问题**: `app/utils/supabase/client.ts` 使用了错误的变量名

**错误代码**:
```typescript
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
```

**正确代码**:
```typescript
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**修复**: 如果使用 `client.ts`，需要修改此文件或添加对应的环境变量

### ⚠️ 3. Next.js 15+ Cookies API

**问题**: `cookies()` 必须 await

**错误代码**:
```typescript
const cookieStore = cookies(); // ❌ Next.js 15+ 中会报错
```

**正确代码**:
```typescript
const cookieStore = await cookies(); // ✅
```

**影响文件**: `app/utils/supabase/server.ts` 已修复

### ⚠️ 4. 数据类型转换

**问题**: 数字字段需要正确转换

```typescript
// ✅ 正确
const insertData = {
  balance: newApi.balance ? Number(newApi.balance) : undefined,
};

// ❌ 错误：直接传字符串
const insertData = {
  balance: newApi.balance, // 可能是字符串 "100.50"
};
```

### ⚠️ 5. 可选字段的处理

**问题**: Supabase 不接受 `null` 和 `undefined` 混用

```typescript
// ✅ 推荐：使用 undefined
const insertData = {
  description: description || undefined,
  balance: balance ? Number(balance) : undefined,
};

// ⚠️ 避免：使用 null 可能导致问题
const insertData = {
  description: description || null,
};
```

### ⚠️ 6. 字段名与关键字冲突

**问题**: 表名 `api-key-pool` 包含连字符

**影响**: 查询时需要使用引号

```typescript
// ✅ 正确
await supabase.from('api-key-pool').select('*');

// ❌ 错误（如果改成 api_key_pool 则可以不用引号）
await supabase.from(api-key-pool).select('*');
```

### ⚠️ 7. 大小写敏感

**问题**: Supabase 字段名大小写敏感

```typescript
// 数据库字段是 created_at
const { data } = await supabase
  .from('api-key-pool')
  .select('created_at'); // ✅ 正确

// ❌ 错误
.select('createdAt'); // 找不到此字段
```

---

## 故障排查

### 问题 1: "Supabase 未配置" 错误

**症状**:
```
Error: Supabase 未配置：请在 `.env.local` 设置 NEXT_PUBLIC_SUPABASE_URL
```

**解决**:
1. 检查 `.env.local` 文件是否存在
2. 确认环境变量名称正确
3. 确认 URL 以 `http://` 或 `https://` 开头
4. 重启开发服务器

### 问题 2: "Invalid API key" 错误

**症状**:
```
Error: Invalid API key
```

**解决**:
1. 检查 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
2. 确认从 Supabase Dashboard 复制的是 **anon public** 密钥
3. 不要使用 **service_role** 密钥（仅服务端使用）

### 问题 3: RLS Policy 错误

**症状**:
```
Error: new row violates row-level security policy for table "api-key-pool"
```

**解决**: 参考 [注意事项 - RLS](#-1-row-level-security-rls)

### 问题 4: 数据插入成功但看不到

**可能原因**:
1. 查询条件不匹配
2. 排序导致数据在末尾
3. 缓存问题

**解决**:
```typescript
// 插入后重新查询
const { error } = await supabase.from('api-key-pool').insert([data]);
if (!error) {
  await fetchApis(); // 重新获取数据
}
```

### 问题 5: CORS 错误

**症状**:
```
Access to fetch at 'https://xxx.supabase.co' has been blocked by CORS policy
```

**解决**:
1. 检查 Supabase 项目设置
2. 确认域名在白名单中
3. 本地开发通常不会有此问题

### 问题 6: 连接超时

**可能原因**:
1. 网络问题
2. Supabase 服务异常
3. URL 配置错误

**解决**:
```typescript
// 添加超时处理
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('请求超时')), 10000)
);

try {
  const result = await Promise.race([
    supabase.from('api-key-pool').select('*'),
    timeout
  ]);
} catch (error) {
  console.error('操作失败:', error.message);
}
```

---

## 性能优化建议

### 1. 只查询需要的字段

```typescript
// ✅ 高效
const { data } = await supabase
  .from('api-key-pool')
  .select('id, llm, key');

// ❌ 低效
const { data } = await supabase
  .from('api-key-pool')
  .select('*');
```

### 2. 使用分页

```typescript
// ✅ 避免一次性加载大量数据
const { data } = await supabase
  .from('api-key-pool')
  .select('*')
  .range(0, 9); // 只加载前 10 条
```

### 3. 添加索引

在 Supabase SQL Editor 中:
```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_api_key_pool_llm ON "api-key-pool"(llm);
CREATE INDEX idx_api_key_pool_key ON "api-key-pool"(key);
```

### 4. 使用 count 优化

```typescript
// ✅ 只获取数量
const { count } = await supabase
  .from('api-key-pool')
  .select('*', { count: 'exact', head: true });

// ❌ 获取所有数据再计算长度
const { data } = await supabase.from('api-key-pool').select('*');
const count = data?.length;
```

---

## 安全建议

### 1. 不要在客户端暴露敏感信息

❌ **避免**:
```typescript
// 不要在客户端日志中打印完整 API Key
console.log('API Key:', apiKey);
```

✅ **推荐**:
```typescript
// 只显示部分信息
console.log('API Key:', apiKey.slice(0, 8) + '...');
```

### 2. 使用 RLS 策略保护数据

✅ 始终为表配置适当的 RLS 策略

### 3. 定期轮换密钥

- 定期在 Supabase Dashboard 重新生成 anon key
- 更新 `.env.local` 文件
- 重启应用

### 4. 不要提交敏感文件到 Git

在 `.gitignore` 中添加:
```
.env.local
.env*.local
```

---

## 快速参考

### 常用导入
```typescript
// 客户端（推荐）
import { supabase, type ApiKeyPool } from '@/lib/supabase';

// 服务端
import { createClient } from '@/app/utils/supabase/server';
const supabase = await createClient();
```

### 基础 CRUD
```typescript
// 查
const { data } = await supabase.from('table').select('*');

// 增
const { error } = await supabase.from('table').insert([{ ... }]);

// 改
const { error } = await supabase.from('table').update({ ... }).eq('id', id);

// 删
const { error } = await supabase.from('table').delete().eq('id', id);
```

### 常用方法
```typescript
.select('*')              // 查询所有字段
.select('id, name')       // 查询指定字段
.eq('field', value)       // 等于
.neq('field', value)      // 不等于
.gt('field', value)       // 大于
.gte('field', value)      // 大于等于
.lt('field', value)       // 小于
.lte('field', value)      // 小于等于
.in('field', [values])    // 在列表中
.like('field', '%value%') // 模糊匹配
.ilike('field', '%value%')// 不区分大小写的模糊匹配
.order('field', { ascending: false }) // 排序
.limit(10)                // 限制数量
.range(0, 9)              // 分页（0-9 表示前 10 条）
```

---

## 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js Supabase 集成指南](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**最后更新**: 2025-12-16
