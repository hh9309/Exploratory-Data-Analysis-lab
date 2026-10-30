import React, { useRef } from 'react';
import { Dataset } from '../types';
import { CASE_DATASETS } from '../data/caseDatasets';
import {
  FlaskConical,
  Upload,
  ChevronDown,
  Sparkles,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

export const Header: React.FC<{
  currentDataset: Dataset;
  onSelectDataset: (dataset: Dataset) => void;
  onOpenAiPanel: () => void;
  alertCount: number;
}> = ({ currentDataset, onSelectDataset, onOpenAiPanel, alertCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local CSV upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows: Record<string, any>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          if (values.length === headers.length) {
            const rowObj: Record<string, any> = {};
            headers.forEach((h, idx) => {
              const num = Number(values[idx]);
              rowObj[h] = !isNaN(num) && values[idx] !== '' ? num : values[idx];
            });
            rows.push(rowObj);
          }
        }

        const customDataset: Dataset = {
          id: `custom_${Date.now()}`,
          title: `用户上传：${file.name.replace(/\.[^/.]+$/, '')}`,
          category: '自定义导入数据',
          description: `由用户本地上传解析的 CSV 数据集，共包含 ${rows.length} 条记录与 ${headers.length} 个字段。`,
          rows: rows.length,
          cols: headers.length,
          data: rows,
          insights: [
            '已成功完成结构化解析并载入 R-EDA-lab 统计流水线',
            '各连续特征已自动匹配 R 语言 numeric 向量',
          ],
        };

        onSelectDataset(customDataset);
      } catch (err) {
        console.error('CSV Parsing Error:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 text-white flex items-center justify-center shadow-xs">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base tracking-tight leading-none">
                R-EDA-lab
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-mono font-bold border border-sky-200">
                R 语言版
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              探索性数据分析 WebApp 实验室：统计摘要、多维探索与关联洞察
            </p>
          </div>
        </div>

        {/* Dataset Switcher & Upload */}
        <div className="flex items-center gap-2.5">
          {/* Dataset Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition-colors">
              <span className="max-w-[140px] truncate">{currentDataset.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                内置实战案例库
              </div>
              {CASE_DATASETS.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => onSelectDataset(ds)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    ds.id === currentDataset.id ? 'text-sky-700 font-bold bg-sky-50/50' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="truncate">{ds.title}</div>
                    <div className="text-[10px] text-slate-400">{ds.category}</div>
                  </div>
                  {ds.id === currentDataset.id && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>导入 CSV</span>
          </button>

          {/* AI Diagnostic Trigger */}
          <button
            onClick={onOpenAiPanel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI 随诊</span>
            {alertCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
