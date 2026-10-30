import React, { useState, useMemo } from 'react';
import { calculateKDE, calculateQQPlotData, calculateMean, calculateSD, calculateQuantile } from '../../utils/statistics';

// Colors for elegant statistical charts
const PALETTE = {
  primary: '#0284c7', // Sky Blue
  accent: '#e11d48',  // Rose/Firebrick
  median: '#7c3aed',  // Violet
  neutral: '#64748b', // Slate
  grid: '#e2e8f0',    // Light border
  bg: '#f8fafc',
};

// 1. Histogram + Kernel Density Estimation (KDE) Chart
export const HistogramWithKDEChart: React.FC<{
  data: number[];
  variableName: string;
  unit?: string;
  showLogToggle?: boolean;
}> = ({ data, variableName, unit = '', showLogToggle = true }) => {
  const [binsCount, setBinsCount] = useState<number>(14);
  const [isLog1p, setIsLog1p] = useState<boolean>(false);
  const [showKDE, setShowKDE] = useState<boolean>(true);
  const [hoveredBin, setHoveredBin] = useState<any | null>(null);

  const processedData = useMemo(() => {
    if (isLog1p) {
      return data.map((v) => Math.log1p(Math.max(0, v)));
    }
    return data;
  }, [data, isLog1p]);

  const stats = useMemo(() => {
    const sorted = [...processedData].sort((a, b) => a - b);
    const mean = calculateMean(sorted);
    const sd = calculateSD(sorted, mean);
    const median = calculateQuantile(sorted, 0.5);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    return { mean, sd, median, min, max, n: sorted.length };
  }, [processedData]);

  // Compute Bins
  const { bins, maxCount, binWidth } = useMemo(() => {
    const min = stats.min;
    const max = stats.max;
    const range = max - min || 1;
    const bWidth = range / binsCount;
    const bArr = Array.from({ length: binsCount }, (_, i) => ({
      x0: min + i * bWidth,
      x1: min + (i + 1) * bWidth,
      count: 0,
      density: 0,
    }));

    processedData.forEach((v) => {
      let idx = Math.floor((v - min) / bWidth);
      if (idx >= binsCount) idx = binsCount - 1;
      if (idx < 0) idx = 0;
      bArr[idx].count++;
    });

    const mCount = Math.max(...bArr.map((b) => b.count), 1);
    bArr.forEach((b) => {
      b.density = b.count / (stats.n * bWidth);
    });

    return { bins: bArr, maxCount: mCount, binWidth: bWidth };
  }, [processedData, binsCount, stats]);

  // Compute KDE points
  const kdePoints = useMemo(() => {
    if (!showKDE) return [];
    return calculateKDE(processedData, 70);
  }, [processedData, showKDE]);

  const maxKdeDensity = useMemo(() => {
    return Math.max(...kdePoints.map((p) => p.density), 0.001);
  }, [kdePoints]);

  const width = 640;
  const height = 300;
  const pad = { top: 25, right: 30, bottom: 40, left: 45 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const minX = stats.min;
  const maxX = stats.max;
  const rangeX = maxX - minX || 1;

  const scaleX = (x: number) => pad.left + ((x - minX) / rangeX) * innerW;
  const scaleYCount = (c: number) => pad.top + innerH - (c / maxCount) * innerH;
  const scaleYKde = (d: number) => pad.top + innerH - (d / maxKdeDensity) * innerH;

  // Generate KDE SVG path
  const kdePathD = useMemo(() => {
    if (kdePoints.length === 0) return '';
    return kdePoints.reduce((acc, pt, idx) => {
      const cx = scaleX(pt.x);
      const cy = scaleYKde(pt.density);
      return idx === 0 ? `M ${cx} ${cy}` : `${acc} L ${cx} ${cy}`;
    }, '');
  }, [kdePoints, scaleX, scaleYKde]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <span>分布形态：{variableName}</span>
            {isLog1p && (
              <span className="px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                log1p(x) 已对数正态化
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            直方图 (频数) + 高斯核密度估计曲线 (KDE) · 均值 {stats.mean.toFixed(2)} / 中位数 {stats.median.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {showLogToggle && (
            <button
              onClick={() => setIsLog1p(!isLog1p)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                isLog1p
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isLog1p ? '还原原始尺度' : '对数变换 log1p(x)'}
            </button>
          )}

          <button
            onClick={() => setShowKDE(!showKDE)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              showKDE ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            KDE 核密度
          </button>

          <div className="flex items-center gap-1 pl-2 text-slate-500">
            <span>分箱:</span>
            <input
              type="range"
              min="6"
              max="28"
              value={binsCount}
              onChange={(e) => setBinsCount(Number(e.target.value))}
              className="w-16 accent-sky-600 h-1"
            />
            <span className="font-mono text-slate-700">{binsCount}</span>
          </div>
        </div>
      </div>

      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = pad.top + innerH * (1 - pct);
            const countLabel = Math.round(maxCount * pct);
            return (
              <g key={pct}>
                <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                <text x={pad.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                  {countLabel}
                </text>
              </g>
            );
          })}

          {/* X Axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = minX + rangeX * pct;
            const x = pad.left + innerW * pct;
            return (
              <g key={pct}>
                <line x1={x} y1={pad.top + innerH} x2={x} y2={pad.top + innerH + 5} stroke="#cbd5e1" />
                <text x={x} y={pad.top + innerH + 16} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="sans-serif">
                  {val.toFixed(isLog1p ? 1 : 0)}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {bins.map((bin, i) => {
            const x = scaleX(bin.x0);
            const bW = Math.max(scaleX(bin.x1) - x - 1.5, 1);
            const y = scaleYCount(bin.count);
            const h = pad.top + innerH - y;
            const isHovered = hoveredBin === bin;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={bW}
                height={h}
                fill={isHovered ? '#0284c7' : '#bae6fd'}
                stroke="#0284c7"
                strokeWidth="1"
                opacity={isHovered ? 0.95 : 0.8}
                rx="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredBin(bin)}
                onMouseLeave={() => setHoveredBin(null)}
              />
            );
          })}

          {/* KDE Curve */}
          {showKDE && kdePathD && (
            <path
              d={kdePathD}
              fill="none"
              stroke="#e11d48"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-xs"
            />
          )}

          {/* Mean Line (Red dash) */}
          <line
            x1={scaleX(stats.mean)}
            y1={pad.top}
            x2={scaleX(stats.mean)}
            y2={pad.top + innerH}
            stroke="#e11d48"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Median Line (Violet dash) */}
          <line
            x1={scaleX(stats.median)}
            y1={pad.top}
            x2={scaleX(stats.median)}
            y2={pad.top + innerH}
            stroke="#7c3aed"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 bg-sky-200 border border-sky-600 rounded-xs inline-block"></span>
            <span>样本直方图频数</span>
          </div>
          {showKDE && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-rose-600 inline-block"></span>
              <span>核密度曲线 (Gaussian KDE)</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-rose-600 border-t border-dashed inline-block"></span>
            <span>均值 Mean: {stats.mean.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-purple-600 border-t border-dashed inline-block"></span>
            <span>中位数 Median: {stats.median.toFixed(2)}</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredBin && (
          <div className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded shadow-lg pointer-events-none backdrop-blur-xs">
            <div>区间: [{hoveredBin.x0.toFixed(2)}, {hoveredBin.x1.toFixed(2)}) {unit}</div>
            <div>样本计数: <span className="font-bold text-sky-300">{hoveredBin.count}</span></div>
            <div>概率密度: {(hoveredBin.density * 100).toFixed(2)}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Normal Q-Q Plot (Quantile-Quantile) Chart
export const NormalQQPlotChart: React.FC<{
  data: number[];
  variableName: string;
}> = ({ data, variableName }) => {
  const qqPoints = useMemo(() => calculateQQPlotData(data), [data]);

  const { minT, maxT, minS, maxS, slope, intercept } = useMemo(() => {
    if (!qqPoints.length) return { minT: -3, maxT: 3, minS: 0, maxS: 100, slope: 1, intercept: 0 };
    const tVals = qqPoints.map((p) => p.theoretical);
    const sVals = qqPoints.map((p) => p.sample);

    const minT = Math.min(...tVals, -2.5);
    const maxT = Math.max(...tVals, 2.5);
    const minS = Math.min(...sVals);
    const maxS = Math.max(...sVals);

    // Q-Q Reference line based on Q25 and Q75
    const sortedS = [...sVals].sort((a, b) => a - b);
    const q1S = calculateQuantile(sortedS, 0.25);
    const q3S = calculateQuantile(sortedS, 0.75);
    const q1T = -0.6745; // Normal quantile at 0.25
    const q3T = 0.6745;  // Normal quantile at 0.75
    const slope = (q3S - q1S) / (q3T - q1T || 1);
    const intercept = q1S - slope * q1T;

    return { minT, maxT, minS, maxS, slope, intercept };
  }, [qqPoints]);

  const width = 480;
  const height = 300;
  const pad = { top: 25, right: 25, bottom: 40, left: 50 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const scaleX = (t: number) => pad.left + ((t - minT) / (maxT - minT || 1)) * innerW;
  const scaleY = (s: number) => pad.top + innerH - ((s - minS) / (maxS - minS || 1)) * innerH;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">正态 Q-Q 图：{variableName}</h4>
          <p className="text-xs text-slate-500">
            样本分位数 vs 理论标准正态分位数 (散点贴合红线即符合正态性)
          </p>
        </div>
      </div>

      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Grid lines */}
          {[-2, -1, 0, 1, 2].map((t) => {
            const x = scaleX(t);
            return (
              <g key={t}>
                <line x1={x} y1={pad.top} x2={x} y2={pad.top + innerH} stroke="#f1f5f9" strokeDasharray="3 3" />
                <text x={x} y={pad.top + innerH + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  {t}
                </text>
              </g>
            );
          })}

          {/* Reference Line */}
          <line
            x1={scaleX(minT)}
            y1={scaleY(intercept + slope * minT)}
            x2={scaleX(maxT)}
            y2={scaleY(intercept + slope * maxT)}
            stroke="#e11d48"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Sample Points */}
          {qqPoints.map((pt, i) => (
            <circle
              key={i}
              cx={scaleX(pt.theoretical)}
              cy={scaleY(pt.sample)}
              r="3.5"
              fill="#0284c7"
              opacity="0.8"
              stroke="#ffffff"
              strokeWidth="0.8"
              className="hover:r-5 transition-all"
            >
              <title>{`理论分位数: ${pt.theoretical.toFixed(2)}, 样本实际值: ${pt.sample.toFixed(2)}`}</title>
            </circle>
          ))}

          {/* Axes */}
          <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#94a3b8" />
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="#94a3b8" />
        </svg>

        <div className="flex items-center justify-between text-xs text-slate-500 px-4 mt-2">
          <span>X 轴: 标准正态分布理论分位数 $Z_p$</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-600 inline-block"></span> 理论正态基准线
          </span>
          <span>Y 轴: 样本观测值</span>
        </div>
      </div>
    </div>
  );
};

// 3. R corrplot Style Heatmap Matrix
export const CorrplotMatrixChart: React.FC<{
  columns: string[];
  matrix: number[][];
  onSelectPair?: (var1: string, var2: string, r: number) => void;
}> = ({ columns, matrix, onSelectPair }) => {
  const [displayMode, setDisplayMode] = useState<'circle' | 'square' | 'number'>('circle');
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number; val: number } | null>(null);

  const n = columns.length;
  const cellSize = 64;
  const labelMargin = 120;
  const totalW = labelMargin + n * cellSize + 20;
  const totalH = labelMargin + n * cellSize + 20;

  const getColor = (r: number) => {
    // r in [-1, 1]
    if (r >= 0) {
      // Blue scale
      const alpha = Math.min(Math.abs(r), 1);
      return `rgba(2, 132, 199, ${Math.max(0.15, alpha)})`;
    } else {
      // Red scale
      const alpha = Math.min(Math.abs(r), 1);
      return `rgba(225, 29, 72, ${Math.max(0.15, alpha)})`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">相关系数矩阵热力图 (R corrplot 规范)</h4>
          <p className="text-xs text-slate-500">
            Pearson 线性相关系数矩阵 · 圆形大小与颜色深浅代表相关性强度 · 点击单元格查看细节
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setDisplayMode('circle')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              displayMode === 'circle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            圆圈 (Circle)
          </button>
          <button
            onClick={() => setDisplayMode('square')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              displayMode === 'square' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            色块 (Square)
          </button>
          <button
            onClick={() => setDisplayMode('number')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              displayMode === 'number' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            数值 (Number)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto py-3">
        <svg viewBox={`0 0 ${totalW} ${totalH}`} className="min-w-[500px] w-full h-auto select-none">
          {/* Top Column Labels */}
          {columns.map((col, j) => {
            const x = labelMargin + j * cellSize + cellSize / 2;
            const y = labelMargin - 12;
            return (
              <text
                key={j}
                x={x}
                y={y}
                textAnchor="start"
                transform={`rotate(-40, ${x}, ${y})`}
                fontSize="11"
                fontWeight="500"
                fill="#334155"
              >
                {col}
              </text>
            );
          })}

          {/* Left Row Labels */}
          {columns.map((col, i) => {
            const y = labelMargin + i * cellSize + cellSize / 2 + 4;
            return (
              <text
                key={i}
                x={labelMargin - 12}
                y={y}
                textAnchor="end"
                fontSize="11"
                fontWeight="500"
                fill="#334155"
              >
                {col}
              </text>
            );
          })}

          {/* Matrix Cells */}
          {columns.map((_, i) =>
            columns.map((_, j) => {
              const r = matrix[i]?.[j] ?? 0;
              const x = labelMargin + j * cellSize;
              const y = labelMargin + i * cellSize;
              const isDiag = i === j;
              const isHovered = hoveredCell?.i === i && hoveredCell?.j === j;
              const isHigh = Math.abs(r) >= 0.85 && !isDiag;

              return (
                <g
                  key={`${i}-${j}`}
                  onClick={() => onSelectPair && onSelectPair(columns[i], columns[j], r)}
                  onMouseEnter={() => setHoveredCell({ i, j, val: r })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="cursor-pointer"
                >
                  {/* Background grid cell */}
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={displayMode === 'square' ? getColor(r) : '#ffffff'}
                    stroke={isHigh ? '#f43f5e' : '#f1f5f9'}
                    strokeWidth={isHigh ? 2 : 1}
                  />

                  {displayMode === 'circle' && (
                    <circle
                      cx={x + cellSize / 2}
                      cy={y + cellSize / 2}
                      r={Math.max(4, Math.abs(r) * (cellSize / 2 - 4))}
                      fill={getColor(r)}
                      stroke={r >= 0 ? '#0284c7' : '#e11d48'}
                      strokeWidth="1.2"
                      opacity={isHovered ? 1 : 0.9}
                    />
                  )}

                  {/* Number Label */}
                  {(displayMode === 'number' || Math.abs(r) > 0.4 || isHovered) && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 4}
                      textAnchor="middle"
                      fontSize={displayMode === 'number' ? '12' : '10'}
                      fontWeight={isDiag ? 'bold' : '600'}
                      fill={
                        displayMode === 'square' && Math.abs(r) > 0.6
                          ? '#ffffff'
                          : Math.abs(r) > 0.8
                          ? r >= 0
                            ? '#0369a1'
                            : '#be123c'
                          : '#475569'
                      }
                    >
                      {r.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-sky-600 inline-block"></span>
            <span>正相关 (r &gt; 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 inline-block"></span>
            <span>负相关 (r &lt; 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-rose-500 rounded-xs inline-block"></span>
            <span>高共线性预警 (|r| ≥ 0.85)</span>
          </div>
        </div>

        {hoveredCell && (
          <div className="font-medium text-slate-800">
            {columns[hoveredCell.i]} ↔ {columns[hoveredCell.j]}:{' '}
            <span className="font-bold text-sky-700 font-mono">r = {hoveredCell.val.toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. GGally::ggpairs Style Scatter Matrix
export const GGPairsScatterMatrix: React.FC<{
  data: Record<string, any>[];
  columns: string[];
  groupCol?: string;
}> = ({ data, columns, groupCol }) => {
  const selectedCols = columns.slice(0, 4); // Show top 4 variables for clean layout
  const n = selectedCols.length;

  const width = 640;
  const cellSize = width / n;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="pb-3 border-b border-slate-100 mb-3">
        <h4 className="font-semibold text-slate-800 text-sm">两两变量散点图矩阵 (R GGally::ggpairs 规范)</h4>
        <p className="text-xs text-slate-500">
          对角线展示核密度分布 · 下三角展示二元散点散布 · 上三角展示 Pearson 统计相关度
        </p>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-1 min-w-[500px]"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {selectedCols.map((colI, i) =>
            selectedCols.map((colJ, j) => {
              const valsI = data.map((d) => Number(d[colI])).filter((v) => !isNaN(v));
              const valsJ = data.map((d) => Number(d[colJ])).filter((v) => !isNaN(v));

              // Diagonal: Variable Name & Mini Distribution
              if (i === j) {
                const mean = calculateMean(valsI);
                const sd = calculateSD(valsI, mean);
                return (
                  <div
                    key={`${i}-${j}`}
                    className="h-28 bg-slate-50 border border-slate-200 rounded-lg p-2 flex flex-col justify-between"
                  >
                    <div className="font-semibold text-xs text-slate-800 truncate" title={colI}>
                      {colI}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                      <div>μ: {mean.toFixed(1)}</div>
                      <div>σ: {sd.toFixed(1)}</div>
                    </div>
                    <div className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.5 rounded text-center">
                      对角分布
                    </div>
                  </div>
                );
              }

              // Upper triangle: Correlation Badge
              if (i < j) {
                // calculate r
                const validPairs = data
                  .map((d) => ({ x: Number(d[colI]), y: Number(d[colJ]) }))
                  .filter((p) => !isNaN(p.x) && !isNaN(p.y));
                const meanX = calculateMean(validPairs.map((p) => p.x));
                const meanY = calculateMean(validPairs.map((p) => p.y));
                let num = 0, dx2 = 0, dy2 = 0;
                validPairs.forEach((p) => {
                  const dx = p.x - meanX;
                  const dy = p.y - meanY;
                  num += dx * dy;
                  dx2 += dx * dx;
                  dy2 += dy * dy;
                });
                const r = num / (Math.sqrt(dx2 * dy2) || 1);

                return (
                  <div
                    key={`${i}-${j}`}
                    className="h-28 bg-white border border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center gap-1"
                  >
                    <span className="text-[10px] text-slate-400">Corr(r)</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        Math.abs(r) > 0.8
                          ? r > 0 ? 'text-sky-700' : 'text-rose-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {r.toFixed(3)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                        Math.abs(r) > 0.85
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : Math.abs(r) > 0.5
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {Math.abs(r) > 0.85 ? '极高共线' : Math.abs(r) > 0.5 ? '中强关联' : '微弱相关'}
                    </span>
                  </div>
                );
              }

              // Lower triangle: Scatter Mini Chart
              const pairs = data
                .map((d) => ({ x: Number(d[colJ]), y: Number(d[colI]), g: d[groupCol || ''] }))
                .filter((p) => !isNaN(p.x) && !isNaN(p.y));

              const minX = Math.min(...pairs.map((p) => p.x));
              const maxX = Math.max(...pairs.map((p) => p.x));
              const minY = Math.min(...pairs.map((p) => p.y));
              const maxY = Math.max(...pairs.map((p) => p.y));

              return (
                <div
                  key={`${i}-${j}`}
                  className="h-28 bg-white border border-slate-200 rounded-lg p-1 relative overflow-hidden"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {pairs.map((pt, k) => {
                      const cx = 5 + ((pt.x - minX) / (maxX - minX || 1)) * 90;
                      const cy = 95 - ((pt.y - minY) / (maxY - minY || 1)) * 90;
                      return (
                        <circle
                          key={k}
                          cx={cx}
                          cy={cy}
                          r="2.5"
                          fill="#0284c7"
                          opacity="0.7"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute bottom-1 right-1 text-[9px] text-slate-400 font-mono">
                    散点 (n={pairs.length})
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// 5. Grouped BoxPlot Chart
export const GroupedBoxPlotChart: React.FC<{
  data: Record<string, any>[];
  valueCol: string;
  groupCol: string;
}> = ({ data, valueCol, groupCol }) => {
  // Group by groupCol
  const groupedStats = useMemo(() => {
    const groups: Record<string, number[]> = {};
    data.forEach((row) => {
      const g = String(row[groupCol] || '全量');
      const v = Number(row[valueCol]);
      if (!isNaN(v)) {
        if (!groups[g]) groups[g] = [];
        groups[g].push(v);
      }
    });

    return Object.entries(groups).map(([groupName, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const q25 = calculateQuantile(sorted, 0.25);
      const median = calculateQuantile(sorted, 0.5);
      const q75 = calculateQuantile(sorted, 0.75);
      const iqr = q75 - q25;
      const lowerFence = q25 - 1.5 * iqr;
      const upperFence = q75 + 1.5 * iqr;

      const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
      const nonOutliers = sorted.filter((v) => v >= lowerFence && v <= upperFence);
      const actualMin = nonOutliers.length ? nonOutliers[0] : min;
      const actualMax = nonOutliers.length ? nonOutliers[nonOutliers.length - 1] : max;

      return {
        groupName,
        min: actualMin,
        q25,
        median,
        q75,
        max: actualMax,
        outliers,
        count: sorted.length,
      };
    });
  }, [data, valueCol, groupCol]);

  const globalMin = Math.min(...groupedStats.map((g) => g.min), 0);
  const globalMax = Math.max(...groupedStats.map((g) => Math.max(g.max, ...(g.outliers || []))), 10);
  const range = globalMax - globalMin || 1;

  const width = 560;
  const height = 260;
  const pad = { top: 20, right: 30, bottom: 45, left: 60 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const scaleY = (v: number) => pad.top + innerH - ((v - globalMin) / range) * innerH;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="pb-3 border-b border-slate-100 mb-3">
        <h4 className="font-semibold text-slate-800 text-sm">分组箱线图：{valueCol} 按 {groupCol}</h4>
        <p className="text-xs text-slate-500">
          Tukey 五数概括 (Min, Q1, Median, Q3, Max) 与 1.5×IQR 离群点检测 (红色孤立点)
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const val = globalMin + range * pct;
          const y = pad.top + innerH * (1 - pct);
          return (
            <g key={pct}>
              <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Boxplots */}
        {groupedStats.map((g, idx) => {
          const slotW = innerW / groupedStats.length;
          const cx = pad.left + idx * slotW + slotW / 2;
          const boxW = Math.min(slotW * 0.55, 45);

          const yQ75 = scaleY(g.q75);
          const yQ25 = scaleY(g.q25);
          const yMed = scaleY(g.median);
          const yMax = scaleY(g.max);
          const yMin = scaleY(g.min);

          return (
            <g key={idx}>
              {/* Whiskers */}
              <line x1={cx} y1={yMax} x2={cx} y2={yQ75} stroke="#64748b" strokeWidth="1.5" />
              <line x1={cx} y1={yMin} x2={cx} y2={yQ25} stroke="#64748b" strokeWidth="1.5" />
              {/* Cap lines */}
              <line x1={cx - boxW / 4} y1={yMax} x2={cx + boxW / 4} y2={yMax} stroke="#64748b" strokeWidth="1.5" />
              <line x1={cx - boxW / 4} y1={yMin} x2={cx + boxW / 4} y2={yMin} stroke="#64748b" strokeWidth="1.5" />

              {/* IQR Box */}
              <rect
                x={cx - boxW / 2}
                y={yQ75}
                width={boxW}
                height={Math.max(yQ25 - yQ75, 2)}
                fill="#e0f2fe"
                stroke="#0284c7"
                strokeWidth="1.5"
                rx="2"
              />

              {/* Median Line */}
              <line
                x1={cx - boxW / 2}
                y1={yMed}
                x2={cx + boxW / 2}
                y2={yMed}
                stroke="#0369a1"
                strokeWidth="2.5"
              />

              {/* Outliers */}
              {g.outliers.map((outV, k) => (
                <circle
                  key={k}
                  cx={cx}
                  cy={scaleY(outV)}
                  r="3.5"
                  fill="#e11d48"
                  stroke="#ffffff"
                  strokeWidth="1"
                >
                  <title>{`离群值: ${outV}`}</title>
                </circle>
              ))}

              {/* X Label */}
              <text
                x={cx}
                y={pad.top + innerH + 18}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#334155"
              >
                {g.groupName}
              </text>
              <text
                x={cx}
                y={pad.top + innerH + 32}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
              >
                (n={g.count})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
