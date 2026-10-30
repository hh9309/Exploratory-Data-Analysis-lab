import React, { useState } from 'react';
import { Dataset } from '../../types';
import { CASE_DATASETS } from '../../data/caseDatasets';
import {
  HistogramWithKDEChart,
  GroupedBoxPlotChart,
  CorrplotMatrixChart,
  GGPairsScatterMatrix,
} from '../charts/InteractiveCharts';
import { computeCorrelationMatrix, profileDataset } from '../../utils/statistics';
import {
  Briefcase,
  TrendingUp,
  Cpu,
  CreditCard,
  Car,
  HeartPulse,
  ShoppingBag,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

export const ModuleCases: React.FC<{
  currentDataset: Dataset;
  onSelectDataset: (dataset: Dataset) => void;
}> = ({ currentDataset, onSelectDataset }) => {
  const [activeCaseId, setActiveCaseId] = useState<string>(currentDataset.id);

  const selectedCase = CASE_DATASETS.find((c) => c.id === activeCaseId) || CASE_DATASETS[0];

  const handleCaseChange = (caseItem: Dataset) => {
    setActiveCaseId(caseItem.id);
    onSelectDataset(caseItem);
  };

  const caseProfiles = profileDataset(selectedCase.data);
  const { columns, matrix } = computeCorrelationMatrix(selectedCase.data, caseProfiles);

  const caseIcons: Record<string, React.ReactNode> = {
    macroeconomics: <TrendingUp className="w-4 h-4 text-sky-600" />,
    manufacturing: <Cpu className="w-4 h-4 text-emerald-600" />,
    fintech_credit: <CreditCard className="w-4 h-4 text-purple-600" />,
    smart_traffic: <Car className="w-4 h-4 text-amber-600" />,
    clinical_trials: <HeartPulse className="w-4 h-4 text-rose-600" />,
    retail_ltv: <ShoppingBag className="w-4 h-4 text-indigo-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 05 · 六大多维工业与科研实战案例库</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              六大 EDA 数据探索实战案例库 (Real-world Case Studies)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              覆盖宏观经济、智能制造、金融风控、智慧交通、临床医学与零售增长六大典型领域。
              点击卡片即可在实验室中无缝载入真实数据，演练不同统计拓扑特征下的探索方案。
            </p>
          </div>
        </div>

        {/* 6 Case Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {CASE_DATASETS.map((item) => {
            const isSelected = item.id === activeCaseId;
            return (
              <button
                key={item.id}
                onClick={() => handleCaseChange(item)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-600 ring-1 ring-sky-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 bg-slate-100 rounded-lg">{caseIcons[item.id]}</div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                {selectedCase.category}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {selectedCase.rows} 样本行 · {selectedCase.cols} 探索字段
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedCase.title}</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {selectedCase.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              当前活动数据流已同步
            </span>
          </div>
        </div>

        {/* Case Key Statistical Insights */}
        <div className="my-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>核心 EDA 统计洞察与业务启示：</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {selectedCase.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Case-specific Specialized Exploratory Visualization */}
        <div className="mt-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>实战定制探索视角 (Case-Specific View)</span>
            <span className="text-xs font-normal text-slate-500">
              — {selectedCase.id === 'macroeconomics' && '宏观时序多变量相关性热力矩阵'}
              {selectedCase.id === 'manufacturing' && '半导体良品率分组箱线图与异常机台透视'}
              {selectedCase.id === 'fintech_credit' && '客户年收入重度右偏与离群点分位数分布'}
              {selectedCase.id === 'smart_traffic' && '全天交通时空通行流量双峰核密度估计 (KDE)'}
              {selectedCase.id === 'clinical_trials' && '给药剂量与无进展生存期两两散点图矩阵 (ggpairs)'}
              {selectedCase.id === 'retail_ltv' && '高净值会员生命周期总价值帕累托长尾分布'}
            </span>
          </h4>

          {selectedCase.id === 'macroeconomics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CorrplotMatrixChart columns={columns} matrix={matrix} />
              <HistogramWithKDEChart
                data={selectedCase.data.map((d) => Number(d.GDP增速_pct))}
                variableName="GDP增速_pct"
                unit="%"
              />
            </div>
          )}

          {selectedCase.id === 'manufacturing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GroupedBoxPlotChart
                data={selectedCase.data}
                valueCol="良品率_pct"
                groupCol="生产班次"
              />
              <HistogramWithKDEChart
                data={selectedCase.data.map((d) => Number(d.原料杂质率_pct))}
                variableName="原料杂质率_pct"
                unit="%"
              />
            </div>
          )}

          {selectedCase.id === 'fintech_credit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistogramWithKDEChart
                data={selectedCase.data.map((d) => Number(d.年总收入_万元))}
                variableName="年总收入_万元"
                unit="万元"
                showLogToggle={true}
              />
              <GroupedBoxPlotChart
                data={selectedCase.data}
                valueCol="信用评分"
                groupCol="职业客群"
              />
            </div>
          )}

          {selectedCase.id === 'smart_traffic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistogramWithKDEChart
                data={selectedCase.data.map((d) => Number(d.通行流量_辆每小时))}
                variableName="通行流量_辆每小时"
                unit="辆/h"
              />
              <GroupedBoxPlotChart
                data={selectedCase.data}
                valueCol="平均车速_kmh"
                groupCol="时段类型"
              />
            </div>
          )}

          {selectedCase.id === 'clinical_trials' && (
            <div className="space-y-6">
              <GGPairsScatterMatrix
                data={selectedCase.data}
                columns={['收缩压_mmHg', '空腹血糖_mmol', 'BMI指数', '生存期_PFS月']}
                groupCol="临床试验分组"
              />
              <GroupedBoxPlotChart
                data={selectedCase.data}
                valueCol="生存期_PFS月"
                groupCol="临床试验分组"
              />
            </div>
          )}

          {selectedCase.id === 'retail_ltv' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HistogramWithKDEChart
                data={selectedCase.data.map((d) => Number(d.生命周期总价值_LTV元))}
                variableName="生命周期总价值_LTV元"
                unit="元"
                showLogToggle={true}
              />
              <GroupedBoxPlotChart
                data={selectedCase.data}
                valueCol="生命周期总价值_LTV元"
                groupCol="会员等级"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
