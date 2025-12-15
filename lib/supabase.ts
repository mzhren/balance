import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !/^https?:\/\//i.test(supabaseUrl)) {
  throw new Error(
    'Supabase 未配置：请在 `.env.local` 设置 NEXT_PUBLIC_SUPABASE_URL（必须以 http:// 或 https:// 开头），然后重启开发服务器。',
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Supabase 未配置：请在 `.env.local` 设置 NEXT_PUBLIC_SUPABASE_ANON_KEY，然后重启开发服务器。',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ApiKeyPool {
  id?: string;
  created_at?: string;
  llm: string;
  key: string;
  balance?: number;
  currency?: string;
  description?: string;
}
