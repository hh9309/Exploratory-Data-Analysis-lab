import React, { useState } from 'react';
import { ColumnProfile, Dataset } from '../../types';
import { Database, FileSpreadsheet, Hash, Layers, AlertTriangle, CheckCircle, Search } from 'lucide-react';

export const ModuleProfiling: React.FC<{
  dataset: Dataset;
  profiles: ColumnProfile[];
  onSelectColumn?: (colName: string) => void;
}> = ({ dataset, profiles, onSelectColumn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showDataPreview, setShowDataPreview] = useState<boolean>(true);

  // High-level Dataset Metrics
  const totalRows = dataset.data.length;
  const totalCols = profiles.length;
  const numericCols = profiles.filter((p) => p.type === 'numeric' || p.type === 'integer');
  const categoryCols = profiles.filter((p) => p.type === 'category');
  const totalCells = totalRows * totalCols;
  const totalMissing = profiles.reduce((acc, p) => acc + p.missingCount, 0);
  const overallCompleteness = totalCells ? ((1 - totalMissing / totalCells) * 100).toFixed(1) : '100';

  // Memory footprint estimate (approx 64 bytes per cell + overhead)
  const estimatedMemoryKB = ((totalCells * 64) / 1024).toFixed(1);

  // Filtered Profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType =
      selectedTypeFilter === 'all' ||
      (selectedTypeFilter === 'numeric' && (p.type === 'numeric' || p.type === 'integer')) ||
      (selectedTypeFilter === 'category' && p.type === 'category');
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Module Intro Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 02 · 变量画像与数据拓扑</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              数据概览与多维变量画像 (Variable Profiling)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              自动识别数值型、分类型与时间序列字段。生成数据集的行列规模、内存占用、完整度与高基数画像，支撑下一步统计推断。
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500 block">当前探索数据集</span>
              <span className="font-semibold text-slate-800 text-sm">{dataset.title}</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-slate-500 block">分类领域</span>
              <span className="font-medium text-sky-700">{dataset.category}</span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
              数据集规模 (Shape)
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {totalRows} <span className="text-xs font-normal text-slate-500">行 ×</span> {totalCols}{' '}
              <span className="text-xs font-normal text-slate-500">列</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              单元格总数: {totalCells.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              类型画像构成
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {numericCols.length} <span className="text-xs font-normal text-slate-500">数值 /</span>{' '}
              {categoryCols.length} <span className="text-xs font-normal text-slate-500">分类</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              R 类型已自动映射
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
              数据完整度 (Completeness)
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {overallCompleteness}%
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              缺失值: {totalMissing} 个
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Hash className="w-3.5 h-3.5 text-purple-600" />
              内存占用估计 (RAM)
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              ~{estimatedMemoryKB} <span className="text-xs font-normal text-slate-500">KB</span>
            </div>
            <span className="text-[11px] text-purple-700 font-medium mt-1 block">
              轻量高效 (R-DataFrame)
            </span>
          </div>
        </div>
      </div>

      {/* Variables Profiling Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              全量字段多维变量画像表 (R Data Dictionary)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              字段类型识别、唯一基数比率、缺失率及取值样例
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="搜索字段名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-sky-500 w-44"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                全部 ({profiles.length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('numeric')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedTypeFilter === 'numeric' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                数值型 ({numericCols.length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('category')}
                className={`px-2.5 py-1 rounded font-medium ${
                  selectedTypeFilter === 'category' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                分类型 ({categoryCols.length})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 font-medium">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">字段名称</th>
                <th className="py-2.5 px-3">数据类型</th>
                <th className="py-2.5 px-3">R 语言对应类型</th>
                <th className="py-2.5 px-3">唯一取值数 (基数)</th>
                <th className="py-2.5 px-3">唯一率</th>
                <th className="py-2.5 px-3">缺失率</th>
                <th className="py-2.5 px-3">取值抽样预览</th>
                <th className="py-2.5 px-3 text-right">探索操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProfiles.map((p, idx) => (
                <tr key={p.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        p.type === 'numeric'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : p.type === 'integer'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {p.type === 'numeric'
                        ? '连续数值 (Continuous)'
                        : p.type === 'integer'
                        ? '离散计数 (Discrete)'
                        : '名义类别 (Nominal)'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{p.rType}</code>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">{p.uniqueCount}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, p.uniqueRate * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px]">{(p.uniqueRate * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {p.missingCount === 0 ? (
                      <span className="text-emerald-600 font-medium">0% (完整)</span>
                    ) : (
                      <span className="text-rose-600 font-medium font-mono">
                        {(p.missingRate * 100).toFixed(1)}% ({p.missingCount})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs truncate font-mono text-[11px]">
                    {p.sampleValues.join(', ')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {p.type === 'numeric' || p.type === 'integer' ? (
                      <button
                        onClick={() => onSelectColumn && onSelectColumn(p.name)}
                        className="text-xs text-sky-700 hover:text-sky-900 font-semibold px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded transition-colors"
                      >
                        分布探索 →
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">类别因子</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Head View */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">数据前瞻视图 (head(df, 8))</h3>
            <span className="text-xs text-slate-400">R: dplyr::glimpse 映射</span>
          </div>

          <button
            onClick={() => setShowDataPreview(!showDataPreview)}
            className="text-xs text-slate-600 hover:text-slate-900 underline"
          >
            {showDataPreview ? '收起表格' : '展开表格'}
          </button>
        </div>

        {showDataPreview && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2 px-3 font-semibold text-slate-400 font-mono">Row</th>
                  {profiles.map((p) => (
                    <th key={p.name} className="py-2 px-3 font-semibold whitespace-nowrap">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {dataset.data.slice(0, 8).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 text-slate-400">{rIdx + 1}</td>
                    {profiles.map((p) => (
                      <td key={p.name} className="py-2 px-3 whitespace-nowrap">
                        {String(row[p.name] !== undefined ? row[p.name] : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
