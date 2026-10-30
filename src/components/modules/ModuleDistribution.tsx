import React, { useState } from 'react';
import { ColumnProfile, Dataset } from '../../types';
import { HistogramWithKDEChart, NormalQQPlotChart } from '../charts/InteractiveCharts';
import { Activity, Sliders, ArrowRight, AlertCircle, CheckCircle2, SplitSquareVertical } from 'lucide-react';

export const ModuleDistribution: React.FC<{
  dataset: Dataset;
  profiles: ColumnProfile[];
  initialVariable?: string;
}> = ({ dataset, profiles, initialVariable }) => {
  const numericProfiles = profiles.filter((p) => p.type === 'numeric' || p.type === 'integer');
  const [selectedVar, setSelectedVar] = useState<string>(
    initialVariable || numericProfiles[0]?.name || ''
  );
  const [showLogComparison, setShowLogComparison] = useState<boolean>(false);

  const curProfile = numericProfiles.find((p) => p.name === selectedVar) || numericProfiles[0];
  const rawValues = dataset.data
    .map((d) => Number(d[selectedVar]))
    .filter((v) => !isNaN(v));

  const logValues = rawValues.map((v) => Math.log1p(Math.max(0, v)));

  // Shape diagnosis logic
  const skew = curProfile?.skewness ?? 0;
  const kurt = curProfile?.kurtosis ?? 0;

  const getShapeDiagnosis = () => {
    if (skew > 1.5) {
      return {
        label: '极端右偏长尾 (Severe Positive Skew)',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        advice: '数据具有极强的正向厚尾，极少数大值拉高了均值。强烈建议在正式线性回归或聚类前进行 log1p(x) 或 Box-Cox 幂变换。',
      };
    }
    if (skew > 0.6) {
      return {
        label: '中度右偏分布 (Moderate Positive Skew)',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        advice: '呈现轻度不对称，中位数相比均值更具鲁棒性。可评估对数变换或分位数回归。',
      };
    }
    if (skew < -0.6) {
      return {
        label: '左偏分布 (Negative Skew)',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        advice: '数据聚集在高值端，低端有拖尾。建议排查是否有截断上限或负向异常值。',
      };
    }
    return {
      label: '近似正态对称 (Near Gaussian Symmetric)',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      advice: '分布形态基本对称，均值与中位数高度贴合，满足标准统计推断与 OLS 最小二乘正态假设。',
    };
  };

  const diagnosis = getShapeDiagnosis();

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 04 · 分布形态与核密度估计</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              分布形态与核密度 (Density) 分析
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              直观展示直方图频数、高斯核密度估计 (KDE) 与 Q-Q 正态性检验。精准诊断高阶偏态与峰度特征，
              支持同屏一键对比对数变换前后的正态化收敛效应。
            </p>
          </div>

          {/* Variable Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">当前分析变量:</span>
            <select
              value={selectedVar}
              onChange={(e) => setSelectedVar(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold outline-hidden focus:border-sky-500"
            >
              {numericProfiles.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} {p.skewness && p.skewness > 1.2 ? '⚠️(右偏)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowLogComparison(!showLogComparison)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showLogComparison
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              {showLogComparison ? '退出对数同屏对比' : '对数变换前后对比'}
            </button>
          </div>
        </div>

        {/* Diagnostic Status Card */}
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${diagnosis.color}`}>
              {diagnosis.label}
            </div>
            <div className="text-xs text-slate-600">
              三阶偏度: <strong className="font-mono text-slate-900">{skew.toFixed(3)}</strong> ·
              四阶峰度: <strong className="font-mono text-slate-900">{kurt.toFixed(3)}</strong>
            </div>
          </div>

          <div className="text-xs text-slate-600 max-w-xl">
            <span className="font-semibold text-slate-800">统计建议：</span>
            {diagnosis.advice}
          </div>
        </div>
      </div>

      {/* Main Charts: Histogram + KDE & Normal Q-Q Plot */}
      {!showLogComparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HistogramWithKDEChart
            data={rawValues}
            variableName={selectedVar}
            showLogToggle={true}
          />
          <NormalQQPlotChart
            data={rawValues}
            variableName={selectedVar}
          />
        </div>
      ) : (
        /* Log Comparison View (Dual side-by-side) */
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
            <strong>对数正态化原理：</strong>针对严格非负的右偏变量 $X$，通过 $Y = \log(1 + X)$ 压缩极端大值间距，
            拉伸密集小值间距，有效消除残差异方差性并使分布趋近于正态钟型。
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HistogramWithKDEChart
              data={rawValues}
              variableName={`${selectedVar} (原始尺度)`}
              showLogToggle={false}
            />
            <HistogramWithKDEChart
              data={logValues}
              variableName={`${selectedVar} (log1p 变换后尺度)`}
              showLogToggle={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
