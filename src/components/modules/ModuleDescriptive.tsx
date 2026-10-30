import React, { useState } from 'react';
import { ColumnProfile, Dataset } from '../../types';
import { Calculator, Sparkles, TrendingUp, HelpCircle, ArrowUpDown } from 'lucide-react';

export const ModuleDescriptive: React.FC<{
  dataset: Dataset;
  profiles: ColumnProfile[];
  onSelectColumn?: (colName: string) => void;
}> = ({ dataset, profiles, onSelectColumn }) => {
  const numericProfiles = profiles.filter((p) => p.type === 'numeric' || p.type === 'integer');
  const [sortField, setSortField] = useState<string>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showRStyle, setShowRStyle] = useState<boolean>(false);

  const sortedProfiles = [...numericProfiles].sort((a, b) => {
    let vA = (a as any)[sortField];
    let vB = (b as any)[sortField];
    if (vA === undefined) vA = 0;
    if (vB === undefined) vB = 0;
    if (typeof vA === 'string') {
      return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
    }
    return sortAsc ? vA - vB : vB - vA;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Calculator className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 03 · 描述性统计与集中离散度量</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              描述性统计摘要与集中/离散度计算 (Descriptive Statistics Summary)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              严格遵循 R 语言 <code className="bg-slate-100 text-sky-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">skimr::skim()</code> 与{' '}
              <code className="bg-slate-100 text-sky-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">psych::describe()</code> 规范。全面衡量均值、中位数、分位数、四分位距
              (IQR)、极差、标准差以及变异系数 (CV)。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRStyle(!showRStyle)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                showRStyle
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showRStyle ? '切换为现代化卡片表' : '切换为 R 控制台输出风格'}
            </button>
          </div>
        </div>

        {/* Statistical Highlights Banner */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-3 text-xs text-sky-900 flex items-start gap-2.5">
            <span className="font-bold text-sky-700 text-sm">①</span>
            <div>
              <strong className="block mb-0.5">集中趋势比较 (Mean vs Median)</strong>
              当数据存在重尾或极端离群值时，中位数具有更高的击穿点（Breakdown Point = 50%）。
            </div>
          </div>
          <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="font-bold text-amber-700 text-sm">②</span>
            <div>
              <strong className="block mb-0.5">离散度与四分位距 (SD vs IQR)</strong>
              $IQR = Q_{75} - Q_{25}$ 仅度量中间 50% 核心样本的扩散范围，天然免疫两端离群噪音。
            </div>
          </div>
          <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-3 text-xs text-purple-900 flex items-start gap-2.5">
            <span className="font-bold text-purple-700 text-sm">③</span>
            <div>
              <strong className="block mb-0.5">无量纲变异系数 (CV = SD / Mean)</strong>
              消除量纲差异，用于客观比较跨物理单位变量的相对波动剧烈程度。
            </div>
          </div>
        </div>
      </div>

      {/* R Console style view if toggled */}
      {showRStyle ? (
        <div className="bg-slate-950 text-slate-100 rounded-xl p-6 font-mono text-xs overflow-x-auto shadow-md border border-slate-800">
          <div className="text-emerald-400 mb-2"># R session: skimr::skim(dataset)</div>
          <div className="text-slate-400 mb-4">
            ── Data Summary ────────────────────────
            <br />
            Name: {dataset.id}
            <br />
            Number of rows: {dataset.rows} | Number of columns: {dataset.cols}
            <br />
            Column type frequency: numeric ({numericProfiles.length})
          </div>
          <div className="text-sky-300 mb-2">── Variable type: numeric ──────────────────</div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-1 px-2">skim_variable</th>
                <th className="py-1 px-2">n_missing</th>
                <th className="py-1 px-2">mean</th>
                <th className="py-1 px-2">sd</th>
                <th className="py-1 px-2">p0(min)</th>
                <th className="py-1 px-2">p25(Q1)</th>
                <th className="py-1 px-2">p50(median)</th>
                <th className="py-1 px-2">p75(Q3)</th>
                <th className="py-1 px-2">p100(max)</th>
                <th className="py-1 px-2">skew</th>
              </tr>
            </thead>
            <tbody>
              {numericProfiles.map((p) => (
                <tr key={p.name} className="border-b border-slate-900 hover:bg-slate-900">
                  <td className="py-1 px-2 font-bold text-white">{p.name}</td>
                  <td className="py-1 px-2 text-slate-400">{p.missingCount}</td>
                  <td className="py-1 px-2 text-amber-300">{p.mean?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-slate-300">{p.sd?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-slate-300">{p.min?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-slate-300">{p.q25?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-emerald-400">{p.median?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-slate-300">{p.q75?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-slate-300">{p.max?.toFixed(2)}</td>
                  <td className="py-1 px-2 text-rose-300">{p.skewness?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Modern Comprehensive Statistics Table */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">全量数值特征描述统计全景表</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                支持点击表头排序 · 结合均值/中位数差率与变异系数进行快速多维排查
              </p>
            </div>
            <div className="text-xs text-slate-500">
              共 <span className="font-bold text-slate-800">{numericProfiles.length}</span> 个连续/计数变量
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      <span>变量名称</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('mean')}>
                    <div className="flex items-center gap-1">
                      <span>均值 (Mean)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('median')}>
                    <div className="flex items-center gap-1">
                      <span>中位数 (P50)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('sd')}>
                    <div className="flex items-center gap-1">
                      <span>标准差 (SD)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('iqr')}>
                    <div className="flex items-center gap-1">
                      <span>四分位距 (IQR)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">极值 [Min, Max]</th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('cv')}>
                    <div className="flex items-center gap-1">
                      <span>变异系数 (CV)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('skewness')}>
                    <div className="flex items-center gap-1">
                      <span>偏度 (Skew)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('kurtosis')}>
                    <div className="flex items-center gap-1">
                      <span>峰度 (Kurt)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center">五数火花概括</th>
                  <th className="py-2.5 px-3 text-right">探索</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {sortedProfiles.map((p) => {
                  const meanVal = p.mean ?? 0;
                  const medVal = p.median ?? 0;
                  const ratio = medVal !== 0 ? Math.abs((meanVal - medVal) / medVal) : 0;
                  const isDistorted = ratio > 0.3;

                  // Mini Sparkline representation: min, q25, med, q75, max
                  const pMin = p.min ?? 0;
                  const pMax = p.max ?? 100;
                  const pRange = pMax - pMin || 1;
                  const normQ25 = ((p.q25 ?? pMin) - pMin) / pRange;
                  const normMed = (medVal - pMin) / pRange;
                  const normQ75 = ((p.q75 ?? pMax) - pMin) / pRange;

                  return (
                    <tr key={p.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold font-sans text-slate-900">
                        {p.name}
                        {isDistorted && (
                          <span
                            className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-500"
                            title="均值与中位数差异较大 (>30%)"
                          />
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-sky-700">{meanVal.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">{medVal.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-600">{p.sd?.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-600">{p.iqr?.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        [{p.min?.toFixed(1)}, {p.max?.toFixed(1)}]
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            (p.cv || 0) > 0.8
                              ? 'bg-amber-50 text-amber-800 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {p.cv?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            (p.skewness || 0) > 1.2
                              ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                              : (p.skewness || 0) < -1.0
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {p.skewness?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.kurtosis?.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">
                        {/* Mini visual spark bar */}
                        <div className="w-20 mx-auto bg-slate-100 h-2.5 rounded-full relative overflow-hidden border border-slate-200">
                          {/* IQR Box */}
                          <div
                            className="absolute top-0 bottom-0 bg-sky-200"
                            style={{
                              left: `${normQ25 * 100}%`,
                              width: `${Math.max(2, (normQ75 - normQ25) * 100)}%`,
                            }}
                          />
                          {/* Median Marker */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-sky-700 z-10"
                            style={{ left: `${normMed * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectColumn && onSelectColumn(p.name)}
                          className="text-xs text-sky-700 hover:text-sky-900 font-sans font-medium hover:underline"
                        >
                          核密度图 →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
