import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini Client on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Universal API endpoint: AI EDA Diagnosis (supports Gemini 3 Flash and DeepSeek V4 Pro)
app.post('/api/model/diagnose', async (req, res) => {
  try {
    const { model, apiKey, datasetName, sampleSummary, customPrompt } = req.body;
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

    if (!effectiveKey) {
      return res.status(400).json({
        success: false,
        error: '未提供 API-Key，无法调用大模型。',
      });
    }

    const systemInstruction = `你是一位精通 R 语言统计学与探索性数据分析（EDA）的资深数据科学家。
请针对用户提供的数据集画像与统计摘要，以专业、严谨、淡雅客观的学术语调进行诊断。
请重点检查：
1. 【严重右偏/长尾分布诊断】：哪些变量偏度过高，未做对数变换 (log/Box-Cox) 可能对线性模型造成何种偏差；
2. 【多重共线性预警】：相关系数过高 (|r| > 0.85) 的变量对，在特征工程和回归分析中的风险及解决策略；
3. 【离群点对统计均值的误导杠杆】：均值与中位数差距巨大的变量，说明极端离群点如何扭曲集中趋势；
4. 【辛普森悖论与分组探索缺失】：建议应引入何种分类变量进行分层观察；
5. 【R语言实战操作指引】：提供 2-3 行地道的 R 语言代码 (如 skimr, dplyr, ggplot2, GGally, scales::log1p) 解决上述问题。
使用规范 Markdown 格式，层级清晰，结构严谨，不要过多废话。`;

    const userPrompt = `【当前分析数据集】：${datasetName || '自定义数据集'}
【统计摘要与变量画像】：
${JSON.stringify(sampleSummary, null, 2)}

${customPrompt ? `【用户关注的焦点】：${customPrompt}` : '请进行全方位的 EDA 统计诊断与潜在陷阱排查。'}`;

    if (model === 'deepseek-v4-pro') {
      // Call DeepSeek API
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!dsRes.ok) {
        const errText = await dsRes.text();
        throw new Error(`DeepSeek API error (${dsRes.status}): ${errText}`);
      }

      const dsData = await dsRes.json();
      const markdown = dsData.choices?.[0]?.message?.content || '未返回有效诊断结果';
      return res.status(200).json({ success: true, source: 'deepseek-v4-pro', markdown });
    }

    // Default to Gemini 3 Flash
    const userAi = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await userAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.status(200).json({
      success: true,
      source: 'gemini-3.8-flash',
      markdown: response.text,
    });
  } catch (error: any) {
    console.error('Diagnosis Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '大模型诊断请求失败',
    });
  }
});

// Universal API endpoint: AI Statistical Q&A
app.post('/api/model/chat', async (req, res) => {
  try {
    const { model, apiKey, messages, datasetContext } = req.body;
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

    if (!effectiveKey) {
      return res.status(400).json({
        success: false,
        error: '未提供 API-Key，无法调用大模型。',
      });
    }

    const systemInstruction = `你是一位资深统计学教授兼 R 语言数据分析导师。
当前用户正在“R 探索性数据分析 WebApp 实验室 (R-EDA-lab)”中进行数据探索。
当前数据集背景：${datasetContext ? JSON.stringify(datasetContext) : '通用统计与EDA'}。
回答要求：
1. 深入浅出讲解统计原理与 EDA 方法论；
2. 给出地道精炼的 R 语言代码示例（使用 tidyverse, ggplot2, skimr, psych, GGally 等生态）；
3. 提示统计陷阱（如辛普森悖论、虚假相关、均值被离群点绑架等）；
4. 语言亲切专业、条理清晰。`;

    if (model === 'deepseek-v4-pro') {
      const dsMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ];

      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: dsMessages,
          temperature: 0.6,
        }),
      });

      if (!dsRes.ok) {
        const errText = await dsRes.text();
        throw new Error(`DeepSeek API error (${dsRes.status}): ${errText}`);
      }

      const dsData = await dsRes.json();
      const reply = dsData.choices?.[0]?.message?.content || '无回答';
      return res.status(200).json({ success: true, reply, source: 'deepseek-v4-pro' });
    }

    // Default: Gemini 3 Flash
    const userAi = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await userAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.status(200).json({
      success: true,
      reply: response.text,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Chat Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '大模型对话请求失败',
    });
  }
});

// Setup Vite middleware in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[R-EDA-lab] Full-stack Server running on port ${PORT}`);
  });
}

startServer();
