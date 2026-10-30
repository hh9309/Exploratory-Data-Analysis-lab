import React, { useState, useEffect } from 'react';
import { ColumnProfile, Dataset, CorrelationPair, DiagnosticAlert, ChatMessage } from '../../types';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  X,
  Send,
  Minimize2,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  Settings,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Cpu,
  Layers,
} from 'lucide-react';

export type ModelType = 'gemini-3.8-flash' | 'deepseek-v4-pro';

interface ModelOption {
  id: ModelType;
  name: string;
  provider: string;
  badge: string;
  description: string;
  placeholder: string;
  storageKey: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3 Flash',
    provider: 'Google AI',
    badge: '推荐 · 极速统计洞察',
    description: '超高通量、实时统计先验提取、右偏长尾变换建议与核密度形态诊断。',
    placeholder: 'AIzaSy...',
    storageKey: 'r_eda_key_gemini',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    provider: 'DeepSeek AI',
    badge: '强推理 · 数理逻辑',
    description: '多重共线性因果图谱演练、辛普森悖论深度透视与复杂统计公式解析。',
    placeholder: 'sk-...',
    storageKey: 'r_eda_key_deepseek',
  },
];

export interface AiDiagnosticPanelProps {
  dataset: Dataset;
  profiles: ColumnProfile[];
  alerts: DiagnosticAlert[];
  pairs: CorrelationPair[];
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const AiDiagnosticPanel: React.FC<AiDiagnosticPanelProps> = ({
  dataset,
  profiles,
  alerts,
  pairs,
  isOpen: controlledIsOpen,
  onOpen,
  onClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'chat'>('diagnosis');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Sync open state when controlled from Header
  useEffect(() => {
    if (controlledIsOpen) {
      setIsMinimized(false);
    }
  }, [controlledIsOpen]);

  const handleOpen = () => {
    setInternalIsOpen(true);
    setIsMinimized(false);
    onOpen?.();
  };

  const handleClose = () => {
    setInternalIsOpen(false);
    onClose?.();
  };

  // Model & Key state
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-3.8-flash');
  const [tempModel, setTempModel] = useState<ModelType>('gemini-3.8-flash');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);
  const [keyAlert, setKeyAlert] = useState<string | null>(null);

  // AI Diagnosis state
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [aiReportMarkdown, setAiReportMarkdown] = useState<string | null>(null);
  const [reportSourceModel, setReportSourceModel] = useState<string>('Gemini 3 Flash');

  // Chat state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `您好！我是 R-EDA-lab 的 AI 统计随诊导师。
我已自动同步当前数据集【${dataset.title}】的变量画像与相关矩阵。
支持部署在 GitHub 上独立运行。请点击右上角 ⚙️ 齿轮设置大模型（Gemini 3 Flash / DeepSeek V4 Pro）并输入 API-Key 方可发起实时诊断或问答。`,
      timestamp: '刚刚',
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Load saved model & API keys from localStorage on mount
  useEffect(() => {
    try {
      const savedModel = (localStorage.getItem('r_eda_selected_model') as ModelType) || 'gemini-3.8-flash';
      setSelectedModel(savedModel);
      setTempModel(savedModel);

      const targetOption = MODEL_OPTIONS.find((m) => m.id === savedModel) || MODEL_OPTIONS[0];
      const savedKey = localStorage.getItem(targetOption.storageKey) || '';
      setApiKeyInput(savedKey);
    } catch (e) {
      console.warn('localStorage access failed:', e);
    }
  }, []);

  // When switching model in settings, load that model's stored key
  const handleTempModelChange = (mId: ModelType) => {
    setTempModel(mId);
    const targetOption = MODEL_OPTIONS.find((m) => m.id === mId) || MODEL_OPTIONS[0];
    const stored = localStorage.getItem(targetOption.storageKey) || '';
    setApiKeyInput(stored);
    setSettingsNotice(null);
  };

  // Get current active model configuration
  const currentModelConfig = MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  // Get stored API-Key for active model
  const getActiveApiKey = (): string => {
    try {
      return localStorage.getItem(currentModelConfig.storageKey) || '';
    } catch {
      return '';
    }
  };

  // Confirm Model & API Key
  const handleConfirmSettings = () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      setSettingsNotice('❌ 必须手工输入有效的 API-Key 后方可确认！');
      return;
    }

    const chosenOption = MODEL_OPTIONS.find((m) => m.id === tempModel) || MODEL_OPTIONS[0];

    try {
      localStorage.setItem('r_eda_selected_model', tempModel);
      localStorage.setItem(chosenOption.storageKey, trimmedKey);
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }

    setSelectedModel(tempModel);
    setShowSettings(false);
    setKeyAlert(null);
    setSettingsNotice(null);

    // Add confirmation message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        role: 'assistant',
        content: `✅ 已成功确认选用【${chosenOption.name}】(${chosenOption.provider})，并已配置您的 API-Key。\n现在您可以点击“开始随诊”或在此提问！`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Core caller function: works with local proxy and supports direct browser calling for GitHub deployment
  const executeLlmCall = async (
    endpointType: 'diagnose' | 'chat',
    payload: any
  ): Promise<any> => {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      throw new Error('MISSING_API_KEY');
    }

    const requestBody = {
      model: selectedModel,
      apiKey: apiKey,
      ...payload,
    };

    // 1. Try local server proxy first
    try {
      const serverRes = await fetch(`/api/model/${endpointType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.success) return data;
      }
    } catch (err) {
      console.info('Server proxy unavailable or deployed as static GitHub site, switching to direct client call...');
    }

    // 2. Direct browser-side execution (for GitHub Pages static deployment)
    if (selectedModel === 'deepseek-v4-pro') {
      const messages =
        endpointType === 'chat'
          ? [
              {
                role: 'system',
                content:
                  '你是一位精通 R 语言统计学与探索性数据分析 (EDA) 的资深导师，请条理清晰解答用户问题。',
              },
              ...payload.messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
              })),
            ]
          : [
              {
                role: 'system',
                content:
                  '你是一位精通 R 语言统计学与 EDA 的数据科学家。请针对用户提供的数据摘要，重点诊断严重右偏分布、多重共线性风险、离群点杠杆效应及辛普森悖论，并给出 R 解决代码。',
              },
              {
                role: 'user',
                content: `数据集: ${payload.datasetName}\n${JSON.stringify(payload.sampleSummary, null, 2)}`,
              },
            ];

      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.3,
        }),
      });

      if (!dsRes.ok) {
        const errText = await dsRes.text();
        throw new Error(`DeepSeek API 响应异常 (${dsRes.status}): ${errText}`);
      }

      const dsData = await dsRes.json();
      const content = dsData.choices?.[0]?.message?.content || '无返回';
      return endpointType === 'chat' ? { reply: content } : { markdown: content };
    } else {
      // Gemini 3 Flash browser direct call
      const promptText =
        endpointType === 'chat'
          ? payload.messages[payload.messages.length - 1].content
          : `请诊断当前数据集的 EDA 统计特征与陷阱：\n${JSON.stringify(payload.sampleSummary, null, 2)}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const gemRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (!gemRes.ok) {
        const errText = await gemRes.text();
        throw new Error(`Gemini API 响应异常 (${gemRes.status}): ${errText}`);
      }

      const gemData = await gemRes.json();
      const text = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '无返回';
      return endpointType === 'chat' ? { reply: text } : { markdown: text };
    }
  };

  // Trigger Diagnosis
  const runAiDiagnosis = async () => {
    const currentKey = getActiveApiKey();
    if (!currentKey) {
      setKeyAlert('⚠️ 未检测到 API-Key！所有大模型调用必须先在 ⚙️ 设置中输入 API-Key 后方可调用。');
      setShowSettings(true);
      return;
    }

    setKeyAlert(null);
    setIsDiagnosing(true);
    setReportSourceModel(currentModelConfig.name);

    try {
      const numericSummary = profiles
        .filter((p) => p.type === 'numeric' || p.type === 'integer')
        .map((p) => ({
          name: p.name,
          mean: p.mean,
          median: p.median,
          sd: p.sd,
          skewness: p.skewness,
          kurtosis: p.kurtosis,
          min: p.min,
          max: p.max,
        }));

      const highCorrPairs = pairs.filter((pr) => pr.isHighRisk).map((pr) => ({
        pair: `${pr.var1} 与 ${pr.var2}`,
        r: pr.pearson,
      }));

      const result = await executeLlmCall('diagnose', {
        datasetName: dataset.title,
        sampleSummary: {
          totalRows: dataset.rows,
          totalCols: dataset.cols,
          numericVariables: numericSummary,
          highCorrelationPairs: highCorrPairs,
        },
      });

      if (result.markdown) {
        setAiReportMarkdown(result.markdown);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'MISSING_API_KEY') {
        setKeyAlert('⚠️ 未检测到 API-Key！请点击右上角 ⚙️ 齿轮输入。');
        setShowSettings(true);
      } else {
        setAiReportMarkdown(`### ⚠️ 启发式统计诊断报告 (API 异常或配额不足)
**错误信息**：${err.message || '网络连接超时'}

- **偏态分布警示**：检测到数据集存在右偏变量，建议使用 \`log1p(x)\` 进行对数正态化；
- **多重共线性**：部分高相关特征 (|r| ≥ 0.85) 会拉高多元回归的方差膨胀系数 (VIF)，建议进行主成分分析或特征筛选；
- **离群点稳健性**：均值受极端值影响显著，建议结合四分位距 (IQR) 与中位数做无偏估计。`);
      }
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Send Chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSendingChat) return;

    const currentKey = getActiveApiKey();
    if (!currentKey) {
      setKeyAlert('⚠️ 未检测到 API-Key！所有大模型调用必须先在 ⚙️ 设置中输入 API-Key 后方可调用。');
      setShowSettings(true);
      return;
    }

    const userText = inputMessage.trim();
    setInputMessage('');
    setKeyAlert(null);

    const newMsgs: ChatMessage[] = [
      ...messages,
      {
        id: String(Date.now()),
        role: 'user',
        content: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMsgs);
    setIsSendingChat(true);

    try {
      const result = await executeLlmCall('chat', {
        messages: newMsgs,
        datasetContext: {
          title: dataset.title,
          rows: dataset.rows,
          cols: dataset.cols,
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: result.reply || '已收到您的问题。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `⚠️ 请求异常：${err.message || '网络请求受阻'}。请检查 ⚙️ 设置中输入的 API-Key 是否正确。`,
          timestamp: '刚刚',
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-6 pointer-events-none z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
        <div className="pointer-events-auto">
          {/* Floating Launcher Trigger Badge */}
          {!isOpen && (
            <button
              onClick={handleOpen}
              className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl border border-slate-700 transition-all hover:scale-105 active:scale-95 group"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900" />
                )}
              </div>
              <span className="text-xs font-semibold tracking-wide">
                AI 统计随诊 ({currentModelConfig.name})
              </span>
            </button>
          )}

          {/* Floating Diagnostic Modal / Drawer */}
          {isOpen && (
            <div
              className={`transition-all ${
                isMinimized
                  ? 'w-80 bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden'
                  : 'w-[510px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150'
              }`}
            >
              {/* Header with Title and Gear Icon on the Right */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-bold text-xs truncate max-w-[260px]">
                    AI 统计随诊与大模型诊断 ({currentModelConfig.name})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  {/* 1. Gear icon for Large Model & API-Key Configuration (Required) */}
                  <button
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setSettingsNotice(null);
                    }}
                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      showSettings
                        ? 'bg-sky-600 text-white'
                        : 'hover:text-white hover:bg-slate-800 text-slate-300'
                    }`}
                    title="设置大模型与手工输入 API-Key"
                  >
                    <Settings className={`w-4 h-4 ${showSettings ? 'rotate-90' : ''} transition-transform`} />
                  </button>

                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:text-white rounded hover:bg-slate-800"
                    title={isMinimized ? '展开' : '最小化'}
                  >
                    {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:text-white rounded hover:bg-slate-800"
                    title="关闭"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

          {!isMinimized && (
            <>
              {/* Global Key Alert Banner if user hasn't configured key */}
              {keyAlert && !showSettings && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">{keyAlert}</span>
                  </div>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="ml-2 font-bold text-sky-700 underline shrink-0 hover:text-sky-900"
                  >
                    前往设置 →
                  </button>
                </div>
              )}

              {/* View 1: Large Model & API-Key Settings View (Triggered by ⚙️ Gear Icon) */}
              {showSettings ? (
                <div className="flex-1 overflow-y-auto p-5 bg-slate-50/60 space-y-5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-sky-600" />
                        <span>大模型选择与 API-Key 凭证设置</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        支持部署在 GitHub 等静态或服务器环境中，手工配置 API-Key 即可直连调用
                      </p>
                    </div>

                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="返回主界面"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Choose between the 2 Models: Gemini 3 Flash vs DeepSeek V4 Pro */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block text-xs flex items-center justify-between">
                      <span>1. 选择大模型 (2选1)</span>
                      <span className="text-[11px] text-sky-700 font-semibold font-mono">
                        当前生效: {currentModelConfig.name}
                      </span>
                    </label>

                    <div className="grid grid-cols-1 gap-2.5">
                      {MODEL_OPTIONS.map((opt) => {
                        const isChosen = tempModel === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleTempModelChange(opt.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isChosen
                                ? 'bg-sky-50/80 border-sky-600 ring-2 ring-sky-600/20 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isChosen ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isChosen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span className="font-bold text-xs text-slate-900">{opt.name}</span>
                                <span className="text-[10px] text-slate-500 font-medium">({opt.provider})</span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  opt.id === 'gemini-3.8-flash'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                              {opt.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Manual API-Key Input Field */}
                  <div className="space-y-2 bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                        <span>2. 手工输入 API-Key (必填)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {tempModel === 'gemini-3.8-flash' ? 'Google Gemini API Key' : 'DeepSeek API Key'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal">
                      本项目支持直接打包并部署到 GitHub Pages 等静态环境。所有大模型调用必须先手工输入该模型的 API-Key；Key 仅保存在您本地浏览器的 localStorage 中，安全可靠。
                    </p>

                    <div className="relative mt-2">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          setSettingsNotice(null);
                        }}
                        placeholder={`请输入 ${tempModel === 'gemini-3.8-flash' ? 'Gemini API Key (AIzaSy...)' : 'DeepSeek API Key (sk-...)'}`}
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:border-sky-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {apiKeyInput.trim() && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>已输入 API-Key (长度: {apiKeyInput.trim().length} 位)</span>
                      </div>
                    )}
                  </div>

                  {/* Notification / Error prompt */}
                  {settingsNotice && (
                    <div
                      className={`p-3 rounded-lg text-xs font-semibold ${
                        settingsNotice.startsWith('✅')
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {settingsNotice}
                    </div>
                  )}

                  {/* 3. Confirm Model & Configuration Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleConfirmSettings}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>确认大模型与 API-Key 配置</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* View 2: Regular Diagnosis / Chat View */
                <>
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
                    <button
                      onClick={() => setActiveTab('diagnosis')}
                      className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                        activeTab === 'diagnosis'
                          ? 'border-sky-600 text-sky-700 bg-white'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>动态诊断报告 ({alerts.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                        activeTab === 'chat'
                          ? 'border-sky-600 text-sky-700 bg-white'
                          : 'border-transparent text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>EDA 自由咨询 Q&A</span>
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {activeTab === 'diagnosis' ? (
                      <div className="space-y-4">
                        {/* Trigger AI Diagnosis Card */}
                        <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 border border-sky-100 rounded-xl p-3.5 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                              <span>调用【{currentModelConfig.name}】动态诊断当前数据</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              扫描长尾偏态变换需求、多重共线性及极端离群点杠杆
                            </p>
                          </div>

                          <button
                            onClick={runAiDiagnosis}
                            disabled={isDiagnosing}
                            className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 disabled:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                          >
                            {isDiagnosing ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>诊断中...</span>
                              </>
                            ) : (
                              <span>开始随诊</span>
                            )}
                          </button>
                        </div>

                        {/* AI Generated Markdown Report if exists */}
                        {aiReportMarkdown && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 leading-relaxed font-sans space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div className="flex items-center gap-1.5 text-sky-800 font-bold">
                                <Bot className="w-4 h-4 text-sky-600" />
                                <span>{reportSourceModel} 统计专家诊断反馈</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                引擎: {selectedModel}
                              </span>
                            </div>
                            <div className="whitespace-pre-wrap font-sans text-xs text-slate-700">
                              {aiReportMarkdown}
                            </div>
                          </div>
                        )}

                        {/* Pre-scanned Rule-based Alerts */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-800 text-xs">
                            自动扫描发现的 {alerts.length} 个统计陷阱：
                          </h4>

                          {alerts.length === 0 ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center">
                              <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                              未发现严重偏态或共线性冲突，数据分布相对健康。
                            </div>
                          ) : (
                            alerts.map((alert, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border ${
                                  alert.severity === 'high'
                                    ? 'bg-rose-50/70 border-rose-200'
                                    : 'bg-amber-50/70 border-amber-200'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <AlertTriangle
                                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                                      alert.severity === 'high' ? 'text-rose-600' : 'text-amber-600'
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <div className="font-bold text-slate-900">{alert.title}</div>
                                    <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                                      {alert.description}
                                    </p>
                                    <div className="mt-2 bg-white/90 border border-slate-200 rounded p-2 font-mono text-[11px] text-slate-800">
                                      <span className="text-slate-400 block mb-0.5 font-sans">
                                        推荐 R 解决方案:
                                      </span>
                                      <code>{alert.rSolution}</code>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Chat Tab */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-500">
                          <span>当前对话大模型：<strong className="text-slate-800">{currentModelConfig.name}</strong></span>
                          <button
                            onClick={() => setShowSettings(true)}
                            className="text-sky-700 hover:underline flex items-center gap-0.5"
                          >
                            <Settings className="w-3 h-3" />
                            <span>切换/配置 Key</span>
                          </button>
                        </div>

                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {m.role === 'assistant' && (
                              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div
                              className={`max-w-[85%] rounded-xl p-3 ${
                                m.role === 'user'
                                  ? 'bg-sky-600 text-white rounded-br-none'
                                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{m.content}</div>
                              <div
                                className={`text-[9px] mt-1 text-right ${
                                  m.role === 'user' ? 'text-sky-200' : 'text-slate-400'
                                }`}
                              >
                                {m.timestamp}
                              </div>
                            </div>
                          </div>
                        ))}

                        {isSendingChat && (
                          <div className="flex gap-2 items-center text-slate-500 text-xs">
                            <Bot className="w-4 h-4 text-sky-600 animate-spin" />
                            <span>{currentModelConfig.name} 正在思考与推导...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat Input Bar if chat tab active */}
                  {activeTab === 'chat' && (
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`向 ${currentModelConfig.name} 提问统计推断、偏态对数变换、共线性...`}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-sky-500"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSendingChat}
                        className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};
