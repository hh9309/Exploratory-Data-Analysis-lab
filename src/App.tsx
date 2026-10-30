import React, { useState, useMemo } from 'react';
import { CASE_DATASETS } from './data/caseDatasets';
import { Dataset, ColumnProfile } from './types';
import {
  profileDataset,
  computeCorrelationMatrix,
  scanDiagnosticAlerts,
} from './utils/statistics';

// Components
import { Header } from './components/Header';
import { WorkflowStepper, WORKFLOW_STEPS } from './components/WorkflowStepper';
import { ModuleAlgebra } from './components/modules/ModuleAlgebra';
import { ModuleProfiling } from './components/modules/ModuleProfiling';
import { ModuleDescriptive } from './components/modules/ModuleDescriptive';
import { ModuleDistribution } from './components/modules/ModuleDistribution';
import { ModuleCases } from './components/modules/ModuleCases';
import { ModuleRCodeEngine } from './components/modules/ModuleRCodeEngine';
import { ModuleAssociation } from './components/modules/ModuleAssociation';
import { ModuleKnowledgeSlices } from './components/modules/ModuleKnowledgeSlices';
import { ModuleReportExport } from './components/modules/ModuleReportExport';
import { AiDiagnosticPanel } from './components/ai/AiDiagnosticPanel';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function App() {
  // Current active dataset (defaults to Macroeconomics)
  const [currentDataset, setCurrentDataset] = useState<Dataset>(CASE_DATASETS[0]);

  // Active module navigation
  const [activeModuleKey, setActiveModuleKey] = useState<string>('profiling');
  const [workflowStepIndex, setWorkflowStepIndex] = useState<number>(0);

  // Selected variable for distribution exploration
  const [targetColumnForDist, setTargetColumnForDist] = useState<string | undefined>(undefined);

  // Floating AI Diagnostic Modal open state
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(false);

  // Calculate full statistical profiles for the active dataset
  const profiles: ColumnProfile[] = useMemo(() => {
    return profileDataset(currentDataset.data);
  }, [currentDataset]);

  // Calculate correlation matrix for numeric columns
  const { columns: numCols, matrix: corrMatrix, pairs: corrPairs } = useMemo(() => {
    return computeCorrelationMatrix(currentDataset.data, profiles);
  }, [currentDataset, profiles]);

  // Scan rule-based statistical diagnostic alerts
  const alerts = useMemo(() => {
    return scanDiagnosticAlerts(profiles, corrPairs);
  }, [profiles, corrPairs]);

  // Handle switching to distribution exploration for a specific column
  const handleInspectColumn = (colName: string) => {
    setTargetColumnForDist(colName);
    setActiveModuleKey('distribution');
    setWorkflowStepIndex(2); // Step 3 in workflow
  };

  // Stepper Next / Prev controls
  const handleNextStep = () => {
    if (workflowStepIndex < WORKFLOW_STEPS.length - 1) {
      const nextIdx = workflowStepIndex + 1;
      setWorkflowStepIndex(nextIdx);
      setActiveModuleKey(WORKFLOW_STEPS[nextIdx].moduleKey);
    }
  };

  const handlePrevStep = () => {
    if (workflowStepIndex > 0) {
      const prevIdx = workflowStepIndex - 1;
      setWorkflowStepIndex(prevIdx);
      setActiveModuleKey(WORKFLOW_STEPS[prevIdx].moduleKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* 1. Header with Dataset Switcher, Upload, and AI status */}
      <Header
        currentDataset={currentDataset}
        onSelectDataset={(ds) => {
          setCurrentDataset(ds);
          setTargetColumnForDist(undefined);
        }}
        onOpenAiPanel={() => setIsAiPanelOpen(true)}
        alertCount={alerts.length}
      />

      {/* 2. Top Navigation & Workflow Stepper (Module 8) */}
      <WorkflowStepper
        currentStepIndex={workflowStepIndex}
        onSelectStepIndex={setWorkflowStepIndex}
        activeModuleKey={activeModuleKey}
        onSelectModuleKey={(key) => {
          setActiveModuleKey(key);
          const sIdx = WORKFLOW_STEPS.findIndex((s) => s.moduleKey === key);
          if (sIdx !== -1) setWorkflowStepIndex(sIdx);
        }}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module 1: 探索代数 */}
        {activeModuleKey === 'algebra' && <ModuleAlgebra />}

        {/* Module 2: 变量画像 */}
        {activeModuleKey === 'profiling' && (
          <ModuleProfiling
            dataset={currentDataset}
            profiles={profiles}
            onSelectColumn={handleInspectColumn}
          />
        )}

        {/* Module 3: 描述统计 */}
        {activeModuleKey === 'descriptive' && (
          <ModuleDescriptive
            dataset={currentDataset}
            profiles={profiles}
            onSelectColumn={handleInspectColumn}
          />
        )}

        {/* Module 4: 分布密度 */}
        {activeModuleKey === 'distribution' && (
          <ModuleDistribution
            dataset={currentDataset}
            profiles={profiles}
            initialVariable={targetColumnForDist}
          />
        )}

        {/* Module 5: 六大案例 */}
        {activeModuleKey === 'cases' && (
          <ModuleCases
            currentDataset={currentDataset}
            onSelectDataset={setCurrentDataset}
          />
        )}

        {/* Module 6: R代码引擎 */}
        {activeModuleKey === 'rcode' && (
          <ModuleRCodeEngine
            dataset={currentDataset}
            profiles={profiles}
          />
        )}

        {/* 关联与多重共线性 */}
        {activeModuleKey === 'association' && (
          <ModuleAssociation
            dataset={currentDataset}
            profiles={profiles}
            columns={numCols}
            matrix={corrMatrix}
            pairs={corrPairs}
          />
        )}

        {/* Module 9: 报告导出 */}
        {activeModuleKey === 'report' && (
          <ModuleReportExport
            dataset={currentDataset}
            profiles={profiles}
            alerts={alerts}
            pairs={corrPairs}
            onSelectDataset={setCurrentDataset}
          />
        )}

        {/* Module 10: 探索切片与陷阱 */}
        {activeModuleKey === 'slices' && <ModuleKnowledgeSlices />}

        {/* Workflow Bottom Stepper Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handlePrevStep}
            disabled={workflowStepIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一步：{workflowStepIndex > 0 ? WORKFLOW_STEPS[workflowStepIndex - 1]?.title : '起点'}</span>
          </button>

          <div className="text-xs text-slate-500 font-mono">
            全流程进度: 步骤 {workflowStepIndex + 1} / {WORKFLOW_STEPS.length}
          </div>

          <button
            onClick={handleNextStep}
            disabled={workflowStepIndex === WORKFLOW_STEPS.length - 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
          >
            <span>
              {workflowStepIndex < WORKFLOW_STEPS.length - 1
                ? `下一步：${WORKFLOW_STEPS[workflowStepIndex + 1]?.title}`
                : '已达终点'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* 4. Module 7: AI 诊断与大模型 Q&A 随诊 (Floating Panel) */}
      <AiDiagnosticPanel
        dataset={currentDataset}
        profiles={profiles}
        alerts={alerts}
        pairs={corrPairs}
        isOpen={isAiPanelOpen}
        onOpen={() => setIsAiPanelOpen(true)}
        onClose={() => setIsAiPanelOpen(false)}
      />

      {/* 5. Minimal Academic Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-700">
            R 探索性数据分析 WebApp 实验室 (R-EDA-lab) · 10 大核心模块
          </p>
          <p className="text-[11px] text-slate-400">
            基于 R 语言统计哲学 (skimr / GGally / corrplot / ggplot2) ·
            非参数核密度估计与稳健统计推断 · 支持本地与大模型智能随诊
          </p>
        </div>
      </footer>
    </div>
  );
}
