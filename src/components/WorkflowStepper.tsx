import React from 'react';
import {
  FileSpreadsheet,
  Calculator,
  Activity,
  Network,
  Download,
  Sigma,
  Briefcase,
  Code2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  moduleKey: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'step1',
    moduleKey: 'profiling',
    number: '01',
    title: '数据接入与画像',
    subtitle: '变量识别与规模拓扑',
    icon: <FileSpreadsheet className="w-4 h-4" />,
  },
  {
    id: 'step2',
    moduleKey: 'descriptive',
    number: '02',
    title: '描述统计与集中度',
    subtitle: 'skimr/psych 离散计算',
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: 'step3',
    moduleKey: 'distribution',
    number: '03',
    title: '分布形态与核密度',
    subtitle: 'KDE 曲线与 Q-Q 检验',
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: 'step4',
    moduleKey: 'association',
    number: '04',
    title: '关联洞察与共线性',
    subtitle: 'corrplot 与 ggpairs 矩阵',
    icon: <Network className="w-4 h-4" />,
  },
  {
    id: 'step5',
    moduleKey: 'report',
    number: '05',
    title: '综合白皮书与报告导出',
    subtitle: 'CSV / HTML / Rmd',
    icon: <Download className="w-4 h-4" />,
  },
];

export const ALL_MODULES = [
  { key: 'algebra', name: '1. 探索代数', icon: <Sigma className="w-3.5 h-3.5" /> },
  { key: 'profiling', name: '2. 变量画像', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
  { key: 'descriptive', name: '3. 描述统计', icon: <Calculator className="w-3.5 h-3.5" /> },
  { key: 'distribution', name: '4. 分布密度', icon: <Activity className="w-3.5 h-3.5" /> },
  { key: 'cases', name: '5. 六大案例', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { key: 'rcode', name: '6. R代码引擎', icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: 'association', name: '7. 关联与共线', icon: <Network className="w-3.5 h-3.5" /> },
  { key: 'report', name: '8. 报告导出', icon: <Download className="w-3.5 h-3.5" /> },
  { key: 'slices', name: '9. 探索切片', icon: <BookOpen className="w-3.5 h-3.5" /> },
];

export const WorkflowStepper: React.FC<{
  currentStepIndex: number;
  onSelectStepIndex: (idx: number) => void;
  activeModuleKey: string;
  onSelectModuleKey: (key: string) => void;
}> = ({ currentStepIndex, onSelectStepIndex, activeModuleKey, onSelectModuleKey }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      {/* 10 Core Modules Quick Switcher Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 uppercase">
            10大核心模块:
          </span>
          {ALL_MODULES.map((mod) => (
            <button
              key={mod.key}
              onClick={() => onSelectModuleKey(mod.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeModuleKey === mod.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {mod.icon}
              <span>{mod.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guided 5-Step Process Indicator (Module 8 Full Flow) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1">
            <span>全流程流水线导引 (Workflow):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isCurrent = currentStepIndex === idx;
              const isCompleted = currentStepIndex > idx;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      onSelectStepIndex(idx);
                      onSelectModuleKey(step.moduleKey);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                        : isCompleted
                        ? 'text-slate-700 font-medium hover:bg-slate-50'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-sky-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </button>

                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
