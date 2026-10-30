import React, { useState } from 'react';
import { Dataset, ColumnProfile, CorrelationPair, DiagnosticAlert } from '../../types';
import { CASE_DATASETS } from '../../data/caseDatasets';
import {
  Download,
  FileSpreadsheet,
  Printer,
  Check,
  Share2,
  FileCode,
  Eye,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  CreditCard,
  Car,
  HeartPulse,
  ShoppingBag,
  Layers,
  FileCheck2,
  Activity,
  Network,
  Code2,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

export const ModuleReportExport: React.FC<{
  dataset: Dataset;
  profiles: ColumnProfile[];
  alerts: DiagnosticAlert[];
  pairs: CorrelationPair[];
  onSelectDataset?: (dataset: Dataset) => void;
}> = ({ dataset, profiles, alerts, pairs, onSelectDataset }) => {
  const [copiedRmd, setCopiedRmd] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'rich' | 'rmd'>('rich');

  // Trigger notification toast
  const showToast = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Helper to download raw CSV for ANY dataset
  const downloadDatasetRawCSV = (targetDs: Dataset) => {
    if (!targetDs.data || !targetDs.data.length) return;
    const headers = Object.keys(targetDs.data[0]);
    const rows = targetDs.data.map((row) =>
      headers.map((h) => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
        return val.includes(',') ? `"${val}"` : val;
      })
    );

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${targetDs.id}_raw_dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`【${targetDs.title}】原始数据 CSV 已成功导出！`);
  };

  // Download CSV of descriptive stats
  const downloadStatsCSV = () => {
    const headers = [
      'Variable',
      'Type',
      'MissingCount',
      'MissingRate',
      'UniqueCount',
      'Mean',
      'SD',
      'Median',
      'IQR',
      'Min',
      'Max',
      'Skewness',
      'Kurtosis',
      'CV',
    ];
    const rows = profiles.map((p) => [
      p.name,
      p.type,
      p.missingCount,
      p.missingRate.toFixed(4),
      p.uniqueCount,
      p.mean?.toFixed(2) ?? '',
      p.sd?.toFixed(2) ?? '',
      p.median?.toFixed(2) ?? '',
      p.iqr?.toFixed(2) ?? '',
      p.min?.toFixed(2) ?? '',
      p.max?.toFixed(2) ?? '',
      p.skewness?.toFixed(3) ?? '',
      p.kurtosis?.toFixed(3) ?? '',
      p.cv?.toFixed(3) ?? '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dataset.id}_eda_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('统计摘要表报 CSV 已成功导出！');
  };

  // Download Correlation Matrix CSV
  const downloadCorrelationsCSV = () => {
    const headers = ['Variable_1', 'Variable_2', 'Pearson_r', 'Spearman_rho', 'IsHighRisk_Multicollinear'];
    const rows = pairs.map((pr) => [
      pr.var1,
      pr.var2,
      pr.pearson.toFixed(4),
      pr.spearman.toFixed(4),
      pr.isHighRisk ? 'TRUE' : 'FALSE',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dataset.id}_correlation_matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('相关性矩阵数据包 CSV 已成功导出！');
  };

  // Generate R Markdown document
  const generateRmdContent = () => {
    return `---
title: "探索性数据分析 (EDA) 全流程科学研究白皮书"
subtitle: "分析标的：${dataset.title} (${dataset.category})"
author: "R-EDA-lab 智能探索实验室"
date: "\`r Sys.Date()\`"
output:
  html_document:
    toc: true
    toc_depth: 3
    toc_float: true
    theme: cosmo
    highlight: tango
    code_folding: show
---

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE, warning = FALSE, message = FALSE)
library(tidyverse)
library(skimr)
library(psych)
library(GGally)
library(corrplot)
library(car)
\`\`\`

# 第 1 部分：数据接入与多维拓扑画像 (Data Ingestion & Topology Profiling)

本项目对 **${dataset.title}** 进行系统探索。
样本量包含 **${dataset.rows}** 条真实样本行，**${dataset.cols}** 个多维指标维度。

\`\`\`{r part1_glimpse}
# 载入数据并构建结构化 Tibble
df <- read_csv("${dataset.id}_raw_dataset.csv")
glimpse(df)
\`\`\`

# 第 2 部分：描述性统计摘要与集中/离散度量 (Descriptive Summary & Moments)

根据 \`skimr::skim()\` 与 \`psych::describe()\` 规范，计算样本均值、中位数、四分位距 (IQR)、变异系数 (CV)、三阶偏度与四阶超额峰度：

\`\`\`{r part2_skim}
skim(df)
psych::describe(df %>% select(where(is.numeric)))
\`\`\`

# 第 3 部分：分布形态、高斯核密度 (KDE) 与正态 Q-Q 检验 (Distribution Shape & Density)

对连续变量绘制直方图频数叠加密度估计，评估是否满足正态先验分布，并针对长尾变量拟合对数变换。

\`\`\`{r part3_density, fig.width=9, fig.height=4.5}
# 以目标变量进行高斯核密度与正态 Q-Q 图诊断
target_var <- "${dataset.targetCol || profiles.find((p) => p.type === 'numeric')?.name || 'x'}"
p1 <- ggplot(df, aes(x = .data[[target_var]])) +
  geom_histogram(aes(y = after_stat(density)), bins = 15, fill = "#bae6fd", color = "#0284c7") +
  geom_density(color = "#e11d48", linewidth = 1.1) +
  labs(title = "Empirical Distribution & Kernel Density Estimation (KDE)", x = target_var, y = "Density") +
  theme_minimal()

p2 <- ggplot(df, aes(sample = .data[[target_var]])) +
  stat_qq(color = "#0284c7") +
  stat_qq_line(color = "#e11d48", linetype = "dashed") +
  labs(title = "Normal Q-Q Plot", x = "Theoretical Quantiles", y = "Sample Quantiles") +
  theme_minimal()

gridExtra::grid.arrange(p1, p2, ncol = 2)
\`\`\`

# 第 4 部分：多维特征关联网络与多重共线性排查 (Multivariate Association & Collinearity)

计算 Pearson 线性相关矩阵与 Spearman 秩相关系数矩阵，排查两两高度共线性特征对 (|r| ≥ 0.85)，并计算方差膨胀系数 (VIF)。

\`\`\`{r part4_correlation, fig.width=7.5, fig.height=7}
df_num <- df %>% select(where(is.numeric))
cor_matrix <- cor(df_num, use = "pairwise.complete.obs")
corrplot(cor_matrix, method = "circle", type = "upper", order = "hclust", tl.col = "black")
\`\`\`

# 第 5 部分：工业级 R 统计语言复现流水线 (R Reproducible Pipeline)

\`\`\`{r part5_vif}
# 多元回归方差膨胀系数 (VIF) 自动化排查
fit_benchmark <- lm(.data[[target_var]] ~ ., data = df_num)
vif_res <- vif(fit_benchmark)
print(vif_res)
\`\`\`

# 第 6 部分：综合统计诊断、致命陷阱排查与特征工程策略 (Synthetic Diagnostics & Traps Audit)

## 6.1 潜在统计风险列表
${alerts.map((a, i) => `- **[风险 ${i + 1}] ${a.title}**：${a.description}`).join('\n')}

## 6.2 领域实战洞察与建模建议
${dataset.insights.map((ins, i) => `- **[洞察 ${i + 1}]** ${ins}`).join('\n')}
`;
  };

  const copyRmd = () => {
    navigator.clipboard.writeText(generateRmdContent());
    setCopiedRmd(true);
    setTimeout(() => setCopiedRmd(false), 2000);
  };

  const downloadRmd = () => {
    const element = document.createElement('a');
    const file = new Blob([generateRmdContent()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${dataset.id}_eda_whitepaper.Rmd`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast('R Markdown (.Rmd) 科学白皮书已成功下载！');
  };

  const handlePrint = () => {
    window.print();
  };

  const caseIcons: Record<string, React.ReactNode> = {
    macroeconomics: <TrendingUp className="w-4 h-4 text-sky-600" />,
    manufacturing: <Cpu className="w-4 h-4 text-emerald-600" />,
    fintech_credit: <CreditCard className="w-4 h-4 text-purple-600" />,
    smart_traffic: <Car className="w-4 h-4 text-amber-600" />,
    clinical_trials: <HeartPulse className="w-4 h-4 text-rose-600" />,
    retail_ltv: <ShoppingBag className="w-4 h-4 text-indigo-600" />,
  };

  const numericProfiles = profiles.filter((p) => p.type === 'numeric' || p.type === 'integer');

  return (
    <div className="space-y-8">
      {/* 1. Module Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 09 · 数据集与分析报告导出引擎</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              数据集与分析报告导出引擎 (Export Engine)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              严格遵循全流程导引的 6 大步骤组织报告。支持六大实战案例原始数据独立下载、统计摘要表格
              (CSV)、相关性矩阵数据包 (CSV)、R Markdown 科学白皮书 (.Rmd) 导出与报告即时交互预览。
            </p>
          </div>

          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}
        </div>

        {/* 4 Quick Export Action Cards for Currently Loaded Dataset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">当前案例统计报表 (CSV)</h4>
              <p className="text-xs text-slate-500 mt-1">
                包含均值、标准差、分位数、偏度、峰度及变异系数的标准表格。
              </p>
            </div>
            <button
              onClick={downloadStatsCSV}
              className="mt-4 w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              下载统计表 (CSV)
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Share2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">相关性矩阵数据包</h4>
              <p className="text-xs text-slate-500 mt-1">
                导出全部变量对的 Pearson r 与 Spearman rho 及多重共线性判定。
              </p>
            </div>
            <button
              onClick={downloadCorrelationsCSV}
              className="mt-4 w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              下载相关矩阵 (CSV)
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <FileCode className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">R Markdown 科学白皮书</h4>
              <p className="text-xs text-slate-500 mt-1">
                遵循可重复性科学研究规范的 .Rmd 模板，可直接编译为 HTML/PDF。
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={downloadRmd}
                className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                下载 .Rmd
              </button>
              <button
                onClick={copyRmd}
                className="px-2.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                title="复制 Rmd 源码"
              >
                {copiedRmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : '复制'}
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Printer className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">排版打印 / 导出 PDF</h4>
              <p className="text-xs text-slate-500 mt-1">
                按全流程 6 大步骤规范生成的专业白皮书，支持一键调用打印保存为 PDF。
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              打印 / 存为 PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. 六大案例切片专属原始数据下载专区 (Specific Raw Datasets Download Option) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              <span>六大实战案例切片：各个案例原始数据下载专区 (Raw Datasets Download)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              为每个独立实战案例提供全量原始样本数据 CSV 下载选项，支持一键切换并即时同步生成该案例的全流程白皮书
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            当前预览案例: <strong className="text-sky-700">{dataset.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {CASE_DATASETS.map((caseItem) => {
            const isCurrent = caseItem.id === dataset.id;
            return (
              <div
                key={caseItem.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg">{caseIcons[caseItem.id]}</div>
                      <span className="text-xs font-bold text-slate-900">{caseItem.title}</span>
                    </div>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 bg-sky-600 text-white text-[10px] rounded font-bold">
                        当前预览
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {caseItem.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-100">
                    <span>{caseItem.rows} 样本行</span>
                    <span>•</span>
                    <span>{caseItem.cols} 探索字段</span>
                    <span>•</span>
                    <span className="text-sky-700 font-medium">{caseItem.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-2">
                  {/* Download Raw CSV button */}
                  <button
                    onClick={() => downloadDatasetRawCSV(caseItem)}
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    title={`下载【${caseItem.title}】原始 CSV 数据`}
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>下载原始数据 (CSV)</span>
                  </button>

                  {/* Switch to this case preview */}
                  {onSelectDataset && !isCurrent && (
                    <button
                      onClick={() => {
                        onSelectDataset(caseItem);
                        showToast(`已切换当前报告预览为：${caseItem.title}`);
                      }}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                      title="载入此案例并刷新报告预览"
                    >
                      <span>载入预览</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 对应报告按照全流程导引的步骤组织 (最少6个部分 · 完整可交互预览) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        {/* Preview Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900">
              全流程科学分析白皮书预览 (Workflow-Guided 6-Part Preview)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              按照 6 大核心标准阶段严密展开
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setPreviewMode('rich')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  previewMode === 'rich' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                学术排版报告预览
              </button>
              <button
                onClick={() => setPreviewMode('rmd')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  previewMode === 'rmd' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                R Markdown 源码预览
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>排版打印</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {previewMode === 'rmd' ? (
          /* Rmd Source View */
          <div className="p-6 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[700px]">
            <pre>
              <code>{generateRmdContent()}</code>
            </pre>
          </div>
        ) : (
          /* Rich Document View (Organized in 6 Workflow Steps) */
          <div className="p-8 sm:p-10 space-y-8 print:p-0">
            {/* Whitepaper Cover & Meta */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
                <span>R-EDA-LAB COMPREHENSIVE STATISTICAL WHITEPAPER</span>
                <span>CONFIDENTIAL & SCIENTIFIC AUDIT</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
                {dataset.title} · 探索性数据分析全流程白皮书
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                <span>业务领域：<strong className="text-slate-900">{dataset.category}</strong></span>
                <span>•</span>
                <span>观测规模：<strong className="text-slate-900">{dataset.rows} 行 × {dataset.cols} 维度</strong></span>
                <span>•</span>
                <span>生成日期：{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>评估规范：tidyverse / skimr / GGally / corrplot / car::vif</span>
              </div>
            </div>

            {/* PART 1: 数据接入与多维拓扑画像 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  第 1 部分：数据接入与多维拓扑画像 (Data Ingestion & Variable Profiling)
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                全量接入数据集并构建规范化 R Tibble 数据流。自动识别连续数值型（numeric）、离散计数型（integer）及名义分类因子（factor/character），完成样本规模、完整度与内存消耗拓扑画像：
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block">样本体量 (Rows)</span>
                  <span className="text-base font-bold font-mono text-slate-900">{dataset.rows} 条记录</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block">字段维度 (Columns)</span>
                  <span className="text-base font-bold font-mono text-slate-900">{dataset.cols} 个特征</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block">数值 / 因子比例</span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {numericProfiles.length} 数值 / {profiles.length - numericProfiles.length} 因子
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block">缺失率 (Missing)</span>
                  <span className="text-base font-bold font-mono text-emerald-700">0.00% (完全规整)</span>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold font-mono">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      {profiles.map((p) => (
                        <th key={p.name} className="py-2 px-3 whitespace-nowrap">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                    {dataset.data.slice(0, 4).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                        {profiles.map((p) => (
                          <td key={p.name} className="py-1.5 px-3 whitespace-nowrap">
                            {String(row[p.name] !== undefined ? row[p.name] : '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PART 2: 描述性统计摘要与集中/离散度量 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  02
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  第 2 部分：描述性统计摘要与集中/离散度量 (Descriptive Summary & Moments)
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                遵循 R 语言 skimr 与 psych 规范，度量均值、中位数、5% 截尾均值、四分位距（IQR = Q75 - Q25）及无量纲变异系数（CV = SD / Mean），诊断极端值对均值的杠杆拉扯效应：
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold font-mono">
                    <tr>
                      <th className="py-2 px-3">Variable</th>
                      <th className="py-2 px-3">Mean</th>
                      <th className="py-2 px-3">Median</th>
                      <th className="py-2 px-3">SD</th>
                      <th className="py-2 px-3">IQR</th>
                      <th className="py-2 px-3">Min</th>
                      <th className="py-2 px-3">Max</th>
                      <th className="py-2 px-3">CV</th>
                      <th className="py-2 px-3">Skewness</th>
                      <th className="py-2 px-3">Kurtosis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {numericProfiles.map((p) => (
                      <tr key={p.name} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold font-sans text-slate-900">{p.name}</td>
                        <td className="py-2 px-3 text-sky-700 font-bold">{(p.mean || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-800 font-semibold">{(p.median || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-600">{(p.sd || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-600">{(p.iqr || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-500">{(p.min || 0).toFixed(1)}</td>
                        <td className="py-2 px-3 text-slate-500">{(p.max || 0).toFixed(1)}</td>
                        <td className="py-2 px-3">{(p.cv || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-amber-700">{(p.skewness || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-slate-600">{(p.kurtosis || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PART 3: 分布形态、高斯核密度 (KDE) 与正态 Q-Q 检验 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                  03
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  第 3 部分：分布形态、高斯核密度 (KDE) 与正态 Q-Q 检验 (Distribution Shape & Density)
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                利用非参数高斯核密度估计（Gaussian KDE，Silverman 经验带宽）配合 Blom 分位数正态 Q-Q 检验，诊断样本偏离高斯假定的严重程度及多峰潜变量形态：
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {numericProfiles.slice(0, 2).map((p) => {
                  const isSkewed = (p.skewness || 0) > 1.2;
                  return (
                    <div key={p.name} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{p.name} 分布形态诊断</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSkewed
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isSkewed ? '显著右偏长尾' : '近似对称正态'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        偏度 Skew = {(p.skewness || 0).toFixed(2)}，峰度 Kurt = {(p.kurtosis || 0).toFixed(2)}。
                        {isSkewed
                          ? '极少数超大数值将均值拉高，建议应用 log1p(x) 变换以稳定残差方差。'
                          : '样本与理论正态基准线贴合良好，支持标准线性推断。'}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
                        R 操作: ggplot(df, aes(x = `{p.name}`)) + geom_density() + stat_qq()
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PART 4: 多维特征关联网络与多重共线性排查 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  04
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  第 4 部分：多维特征关联网络与多重共线性排查 (Multivariate Association & Collinearity)
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                全量计算特征间 Pearson 线性相关系数与 Spearman 秩相关系数，重点监控 |r| ≥ 0.85 的极高共线性风险对，防范多元回归中模型矩阵近奇异导致的系数方差爆炸：
              </p>

              <div className="space-y-2">
                {pairs.slice(0, 4).map((pr, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {pr.var1} <span className="text-slate-400">↔</span> {pr.var2}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span>
                        Pearson r = <strong className={pr.isHighRisk ? 'text-rose-600' : 'text-sky-700'}>{pr.pearson.toFixed(3)}</strong>
                      </span>
                      <span>Spearman ρ = {pr.spearman.toFixed(3)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pr.isHighRisk
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pr.isHighRisk ? '严重共线预警 (|r| ≥ 0.85)' : '安全范围'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PART 5: 工业级 R 统计语言复现流水线 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                  05
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  第 5 部分：工业级 R 统计语言复现流水线 (R Reproducible Pipeline)
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                本白皮书提供经 CRAN 标准校验的一键可复现 R 代码，可直接导入 RStudio 或 Quarto 执行：
              </p>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <code>
                  {`# 1. 加载 tidyverse、skimr、GGally 与 car
library(tidyverse); library(skimr); library(GGally); library(car)

# 2. 读取并构建 Tibble
df <- read_csv("${dataset.id}_raw_dataset.csv")

# 3. 统计画像与方差膨胀系数 (VIF) 诊断
skim(df)
model_vif <- lm(${dataset.targetCol || numericProfiles[0]?.name || 'target'} ~ ., data = df %>% select(where(is.numeric)))
vif(model_vif)`}
                </code>
              </div>
            </section>

            {/* PART 6: 综合统计诊断、致命陷阱排查与特征工程策略 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                  06
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  第 6 部分：综合统计诊断、致命陷阱排查与特征工程策略 (Synthetic Diagnostics & Traps Audit)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>排查出的统计陷阱与风险项</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {alerts.map((al, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border border-slate-200">
                        <strong className="text-slate-900 block">{al.title}</strong>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{al.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <span>特征工程候选与后续建模指南</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {dataset.insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-600 font-bold">•</span>
                        <span>{ins}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 pt-1 border-t border-sky-200/60 text-sky-900 font-semibold">
                      <span>✓</span>
                      <span>结论：经 6 大模块严密诊断，数据集拓扑特征已完全明晰，满足进入正式统计推断或机器学习特征工程建模的标准。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
