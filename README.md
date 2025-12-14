# 大模型 API 余额查询工具

一个支持多个大模型平台的 API 余额批量查询工具。

## 支持的平台

- ✅ **DeepSeek** - DeepSeek AI
- ✅ **OpenAI** - OpenAI GPT 系列
- ✅ **字节火山** - 字节跳动火山引擎
- ✅ **阿里千问** - 阿里云通义千问
- ✅ **硅基流动** - SiliconFlow

## 功能特点

- 🔐 **安全存储** - API Key 仅在前端临时存储，不会上传到服务器
- 📊 **批量查询** - 支持同时查询多个平台的余额
- 💰 **详细信息** - 显示余额、总额、已用额度等详细信息
- 🎨 **美观界面** - 响应式设计，支持深色模式
- ⚡ **快速响应** - 并发请求，快速获取结果

## 开始使用

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

## 使用说明

### 1. 添加 API Key

1. 选择平台（DeepSeek、OpenAI 等）
2. 输入您的 API Key
3. 可选：添加备注名称以便识别
4. 点击"添加"按钮

### 2. 批量查询

- 添加多个 API Key 后，点击"批量查询余额"按钮
- 系统将并发查询所有 API Key 的余额信息
- 查询结果会实时显示在每个 API Key 下方

### 3. 查看结果

每个查询结果包含：
- 💰 当前余额
- 📊 总额度（如果可用）
- 📉 已使用额度（如果可用）
- 💱 货币单位（CNY/USD）
- 📋 详细信息（可展开查看）

## API 端点说明

### POST /api/check-balance

查询指定平台的 API 余额。

**请求体：**
```json
{
  "provider": "deepseek",  // 平台标识
  "apiKey": "sk-xxxxx"     // API Key
}
```

**响应：**
```json
{
  "balance": 100.50,       // 余额
  "total": 200.00,         // 总额
  "used": 99.50,           // 已用
  "currency": "CNY",       // 货币
  "details": {}            // 详细信息
}
```

## 平台 API 文档

### DeepSeek
- 官网: https://www.deepseek.com/
- API 文档: https://platform.deepseek.com/docs

### OpenAI
- 官网: https://openai.com/
- API 文档: https://platform.openai.com/docs

### 字节火山
- 官网: https://www.volcengine.com/
- API 文档: https://www.volcengine.com/docs/

### 阿里千问
- 官网: https://tongyi.aliyun.com/
- API 文档: https://help.aliyun.com/zh/dashscope/

### 硅基流动
- 官网: https://siliconflow.cn/
- API 文档: https://docs.siliconflow.cn/

## 注意事项

⚠️ **重要提示**：

1. **API Key 安全**
   - 请勿将 API Key 提交到版本控制系统
   - 本工具仅在前端临时存储 API Key
   - 建议仅在本地环境使用

2. **API 限制**
   - 不同平台的 API 可能有调用频率限制
   - 某些平台可能需要额外的认证机制

3. **数据准确性**
   - 余额数据来自各平台的官方 API
   - 部分平台可能存在缓存延迟

## 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **运行时**: Node.js

## 开发

### 项目结构

```
balance/
├── app/
│   ├── api/
│   │   └── check-balance/
│   │       └── route.ts          # API 路由
│   ├── components/
│   │   └── BalanceChecker.tsx    # 主组件
│   ├── layout.tsx
│   ├── page.tsx                  # 首页
│   └── globals.css
├── public/
├── package.json
└── README.md
```

### 添加新平台

要添加新的平台支持：

1. 在 `app/components/BalanceChecker.tsx` 中的 `PROVIDERS` 数组添加新平台
2. 在 `app/api/check-balance/route.ts` 中添加对应的检查函数
3. 在 switch 语句中添加新的 case

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
