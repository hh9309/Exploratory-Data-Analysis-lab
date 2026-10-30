import React, { useState } from 'react';
import { Dataset, ColumnProfile, CorrelationPair } from '../../types';
import { CorrplotMatrixChart, GGPairsScatterMatrix } from '../charts/InteractiveCharts';
import { Network, AlertTriangle, ArrowRight, CheckCircle2, Sliders } from 'lucide-react';
import { calculatePearson, calculateMean, calculateSD } from '../../utils/statistics';

export const ModuleAssociation: React.FC<{
  dataset: Dataset;
  profiles: ColumnProfile[];
  columns: string[];
  matrix: number[][];
  pairs: CorrelationPair[];
}> = ({ dataset, profiles, columns, matrix, pairs }) => {
  const [selectedPair, setSelectedPair] = useState<[string, string]>([
    columns[0] || '',
    columns[1] || '',
  ]);

  const [var1, var2] = selectedPair;

  // Selected bivariate pair data
  const bivariatePoints = dataset.data
    .map((row) => ({ x: Number(row[var1]), y: Number(row[var2]) }))
    .filter((pt) => !isNaN(pt.x) && !isNaN(pt.y));

  const xVals = bivariatePoints.map((p) => p.x);
  const yVals = bivariatePoints.map((p) => p.y);
  const curR = calculatePearson(xVals, yVals);

  // Linear Regression parameters
  const meanX = calculateMean(xVals);
  const meanY = calculateMean(yVals);
  const sdX = calculateSD(xVals, meanX);
  const sdY = calculateSD(yVals, meanY);
  const slope = sdX !== 0 ? (curR * sdY) / sdX : 0;
  const intercept = meanY - slope * meanX;

  const minX = Math.min(...xVals, 0);
  const maxX = Math.max(...xVals, 100);
  const minY = Math.min(...yVals, 0);
  const maxY = Math.max(...yVals, 100);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const highRiskPairs = pairs.filter((p) => p.isHighRisk);

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Network className="w-3.5 h-3.5 text-sky-600" />
              <span>多维探索与关联洞察 · 相关性拓扑</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              多维关联洞察与多重共线性预警 (Association & Multicollinearity)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              基于 R 语言 <code className="font-mono text-sky-800 font-semibold">corrplot</code> 与{' '}
              <code className="font-mono text-sky-800 font-semibold">GGally::ggpairs</code> 规范。
              探索自变量之间的正负线性与非线性拓扑，诊断潜在的多重共线性威胁。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                highRiskPairs.length > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {highRiskPairs.length > 0
                ? `⚠️ 发现 ${highRiskPairs.length} 组高度共线性风险 (|r| ≥ 0.85)`
                : '✓ 未见严重共线性风险 (|r| < 0.85)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts: Corrplot and ggpairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorrplotMatrixChart
          columns={columns}
          matrix={matrix}
          onSelectPair={(v1, v2) => setSelectedPair([v1, v2])}
        />

        {/* Custom Bivariate Scatter + Regression Explorer */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">
                  自选二元特征散点与回归拟合线
                </h4>
                <p className="text-xs text-slate-500">
                  观测两两特征微观散布、离群杠杆点与 OLS 最小二乘线性拟合
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <select
                  value={var1}
                  onChange={(e) => setSelectedPair([e.target.value, var2])}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      X: {c}
                    </option>
                  ))}
                </select>
                <span className="text-slate-400">↔</span>
                <select
                  value={var2}
                  onChange={(e) => setSelectedPair([var1, e.target.value])}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      Y: {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scatter SVG */}
            <div className="relative pt-3">
              <svg viewBox="0 0 460 250" className="w-full h-auto select-none bg-slate-50/50 rounded-lg">
                {/* Points */}
                {bivariatePoints.map((pt, i) => {
                  const cx = 45 + ((pt.x - minX) / rangeX) * 380;
                  const cy = 215 - ((pt.y - minY) / rangeY) * 180;
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#0284c7"
                      opacity="0.8"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Regression Line */}
                <line
                  x1={45}
                  y1={215 - ((intercept + slope * minX - minY) / rangeY) * 180}
                  x2={425}
                  y2={215 - ((intercept + slope * maxX - minY) / rangeY) * 180}
                  stroke="#e11d48"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Axes */}
                <line x1="45" y1="215" x2="425" y2="215" stroke="#94a3b8" />
                <line x1="45" y1="35" x2="45" y2="215" stroke="#94a3b8" />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="font-mono">
              <span className="text-slate-500">拟合直线:</span>{' '}
              <strong className="text-slate-800">
                y = {intercept.toFixed(2)} + {slope.toFixed(2)}x
              </strong>
            </div>
            <div className="font-mono">
              <span className="text-slate-500">Pearson r:</span>{' '}
              <strong className={Math.abs(curR) > 0.8 ? 'text-rose-600' : 'text-sky-700'}>
                {curR.toFixed(3)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* GGally Scatter Matrix */}
      <GGPairsScatterMatrix
        data={dataset.data}
        columns={columns}
        groupCol={dataset.groupCol}
      />
    </div>
  );
};
