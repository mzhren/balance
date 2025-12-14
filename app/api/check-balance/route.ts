import { NextRequest, NextResponse } from 'next/server';

interface BalanceCheckRequest {
  provider: string;
  apiKey: string;
}

// DeepSeek Balance Check
async function checkDeepSeek(apiKey: string) {
  const response = await fetch('https://api.deepseek.com/user/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 错误: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    balance: data.balance_infos?.[0]?.total_balance || 0,
    total: data.balance_infos?.[0]?.total_balance || 0,
    currency: 'CNY',
    details: data,
  };
}

// OpenAI Balance Check
async function checkOpenAI(apiKey: string) {
  // Note: OpenAI deprecated the billing endpoint, but this is for reference
  const response = await fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAI API 错误: ${response.status}`);
  }

  const subscription = await response.json();
  
  // Get usage
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const usageResponse = await fetch(
    `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const usage = await usageResponse.json();
  
  const total = subscription.hard_limit_usd || 0;
  const used = usage.total_usage / 100 || 0;
  
  return {
    balance: total - used,
    total: total,
    used: used,
    currency: 'USD',
    details: { subscription, usage },
  };
}

// 字节火山 Balance Check
async function checkVolcengine(apiKey: string) {
  // 火山引擎的API需要更复杂的签名机制，这里提供基础框架
  const response = await fetch('https://open.volcengineapi.com/api/v3/billing/balance', {
    method: 'GET',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`火山引擎 API 错误: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    balance: data.AvailableBalance || 0,
    total: data.TotalBalance || 0,
    currency: 'CNY',
    details: data,
  };
}

// 阿里千问 Balance Check
async function checkQwen(apiKey: string) {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`千问 API 错误: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    balance: data.data?.available_amount || 0,
    total: data.data?.total_amount || 0,
    used: data.data?.used_amount || 0,
    currency: 'CNY',
    details: data,
  };
}

// 硅基流动 Balance Check
async function checkSiliconFlow(apiKey: string) {
  const response = await fetch('https://api.siliconflow.cn/v1/user/info', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`硅基流动 API 错误: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    balance: data.data?.balance || 0,
    total: data.data?.totalBalance || 0,
    used: (data.data?.totalBalance - data.data?.balance) || 0,
    currency: 'CNY',
    details: data,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: BalanceCheckRequest = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    let result;

    switch (provider) {
      case 'deepseek':
        result = await checkDeepSeek(apiKey);
        break;
      case 'openai':
        result = await checkOpenAI(apiKey);
        break;
      case 'volcengine':
        result = await checkVolcengine(apiKey);
        break;
      case 'qwen':
        result = await checkQwen(apiKey);
        break;
      case 'siliconflow':
        result = await checkSiliconFlow(apiKey);
        break;
      default:
        return NextResponse.json(
          { error: '不支持的平台' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '查询失败',
      },
      { status: 500 }
    );
  }
}
