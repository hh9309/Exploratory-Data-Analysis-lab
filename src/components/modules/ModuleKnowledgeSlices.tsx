import React, { useState } from 'react';
import {
  getAnscombesQuartet,
  getSimpsonsParadoxDemo,
  calculatePearson,
  calculateMean,
  calculateSD,
} from '../../utils/statistics';
import {
  BookOpen,
  AlertOctagon,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const ModuleKnowledgeSlices: React.FC = () => {
  const [activeSlice, setActiveSlice] = useState<number>(1);

  // Slice 3 Interactive Simpson's Paradox State
  const [showSimpsonGrouped, setShowSimpsonGrouped] = useState<boolean>(false);
  const simpsonData = getSimpsonsParadoxDemo();

  // Compute Simpson overall correlation vs grouped correlation
  const overallX = simpsonData.map((d) => d.x);
  const overallY = simpsonData.map((d) => d.y);
  const overallR = calculatePearson(overallX, overallY);

  // Group A, B, C correlations
  const groupA = simpsonData.filter((d) => d.group.includes('部门 A'));
  const groupB = simpsonData.filter((d) => d.group.includes('部门 B'));
  const groupC = simpsonData.filter((d) => d.group.includes('部门 C'));

  const rA = calculatePearson(groupA.map((d) => d.x), groupA.map((d) => d.y));
  const rB = calculatePearson(groupB.map((d) => d.x), groupB.map((d) => d.y));
  const rC = calculatePearson(groupC.map((d) => d.x), groupC.map((d) => d.y));

  // Anscombe's quartet data
  const quartet = getAnscombesQuartet();
  const [selectedQuartetId, setSelectedQuartetId] = useState<string>('I');
  const activeQuartet = quartet.find((q) => q.id === selectedQuartetId) || quartet[0];

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 10 · 统计探索原理与四维切片</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              探索性分析基本要素与多维切片知识导引
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              系统解构 EDA 三大要素（集中趋势、离散程度、分布形态），剖析多重共线性识别机制，
              并通过“辛普森悖论交互演练”与“安斯库姆四重奏”交互实验，揭示盲目套用公式的致命统计陷阱。
            </p>
          </div>
        </div>

        {/* 4 Slice Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {[
            { id: 1, title: '切片一：三大要素画像解构', subtitle: '集中趋势、离散程度、分布形态' },
            { id: 2, title: '切片二：相关与共线性预警', subtitle: 'Pearson / Spearman & VIF' },
            { id: 3, title: '切片三：三大致命分析陷阱', subtitle: '辛普森悖论与安斯库姆四重奏' },
            { id: 4, title: '切片四：误区警示与方法论', subtitle: '从随机画图到闭环科学推断' },
          ].map((slice) => (
            <button
              key={slice.id}
              onClick={() => setActiveSlice(slice.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                activeSlice === slice.id
                  ? 'bg-sky-50/80 border-sky-600 ring-1 ring-sky-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-sky-700">SLICE 0{slice.id}</span>
                {activeSlice === slice.id && (
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                )}
              </div>
              <div className="font-bold text-xs text-slate-900">{slice.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{slice.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Slice 1 */}
      {activeSlice === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片一：EDA 基本要素的统计画像解构】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              探索性数据分析（EDA）由“集中趋势”、“离散程度”与“分布形态”三大基本要素交织构成。图表优先（Visual-first）。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-bold rounded">
                要素 A
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">
                集中趋势 (Central Tendency)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                描述数据的中心位置。常用度量包括算术均值 x̄、中位数 Median 与截尾均值。
              </p>
              <div className="mt-3 bg-white p-2.5 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>• 均值：敏感于极端值，击穿点为 0%</div>
                <div>• 中位数：对异常值具有极高抗性，击穿点 50%</div>
                <div>• 截尾均值：剔除上下 5% 离群点，兼顾效率与稳健性</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                要素 B
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">
                离散程度 (Dispersion & Spread)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                度量样本围绕中心取值的波动范围与风险程度。
              </p>
              <div className="mt-3 bg-white p-2.5 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>• 标准差 (SD)：表征样本二阶中心矩扩散</div>
                <div>• 四分位距 (IQR = Q75 - Q25)：度量核心 50% 范围</div>
                <div>• 变异系数 (CV = SD / Mean)：跨物理量纲波动对比</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-bold rounded">
                要素 C
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">
                分布形态 (Distribution Shape)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                诊断数据是否服从对称钟型，是否存在右偏厚尾、双峰或低峰扁平。
              </p>
              <div className="mt-3 bg-white p-2.5 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
                <div>• 偏度 (Skewness)：三阶中心矩，判断长尾朝向</div>
                <div>• 峰度 (Kurtosis)：四阶中心矩，判断尖峰重尾程度</div>
                <div>• 核密度估计 (KDE)：非参数概率密度逼近</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slice 2 */}
      {activeSlice === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片二：相关性分析与多重共线性预警】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              通过 Pearson / Spearman 矩阵洞察变量间线性与非线性关联，提前识别特征工程中的多重共线性风险。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h4 className="font-bold text-sm text-slate-900">
                1. 皮尔逊 (Pearson) vs 斯皮尔曼 (Spearman)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pearson 相关系数 $r$ 仅度量严格线性关系，对非正态分布与异常杠杆点极度敏感。
                当变量存在非线性单调关系（如指数增长、幂律衰减）或严重偏态时，基于秩次的 Spearman 秩相关系数更为客观可靠。
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                # R 计算对比：
                <br />
                cor(x, y, method = "pearson")
                <br />
                cor(x, y, method = "spearman")
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h4 className="font-bold text-sm text-slate-900">
                2. 多重共线性的危害与 VIF 预警阈值
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                当自变量间两两相关系数 $|r| &gt; 0.85$ 时，多元线性回归矩阵 $X^T X$ 接近奇异矩阵（近不可逆）。
                这会导致回归系数方差急剧膨胀、置信区间宽到失去意义，甚至出现回归系数符号与实际经验相反的“假象”。
              </p>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 space-y-1">
                <div>• 方差膨胀系数 VIF_j = 1 / (1 - R_j^2)</div>
                <div>• <strong>安全阈值：</strong>VIF &lt; 5 (无显著共线性)</div>
                <div>• <strong>严重警示：</strong>VIF &gt; 10 (强烈建议删除冗余变量或进行 PCA 降维)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slice 3: Interactive Simpson's Paradox & Anscombe's Quartet */}
      {activeSlice === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片三：三大致命 EDA 分析陷阱】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              均值掩盖双峰/偏态；盲目计算相关系数忽视非线性与异常点强杠杆；在未分组情况下做整体统计导致“辛普森悖论 (Simpson's Paradox)”。
            </p>
          </div>

          {/* Trap 1 & 2 Interactive: Anscombe's Quartet */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  实验 1：安斯库姆四重奏 (Anscombe's Quartet)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  四个数据集拥有完全相同的统计数值：均值 9.0、方差 11.0、相关系数 r=0.82，但在图形中形态完全迥异！
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                {quartet.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuartetId(q.id)}
                    className={`px-3 py-1 rounded font-medium ${
                      selectedQuartetId === q.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    数据集 {q.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-4">
              <div className="md:col-span-2">
                <svg viewBox="0 0 500 220" className="w-full h-auto select-none bg-white rounded-lg border border-slate-200">
                  {/* Scatter points */}
                  {activeQuartet.x.map((xVal, i) => {
                    const yVal = activeQuartet.y[i];
                    const cx = 40 + ((xVal - 3) / 18) * 420;
                    const cy = 200 - ((yVal - 2) / 12) * 170;
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                  {/* Regression line y = 3 + 0.5x */}
                  <line
                    x1={40 + ((4 - 3) / 18) * 420}
                    y1={200 - ((5 - 2) / 12) * 170}
                    x2={40 + ((19 - 3) / 18) * 420}
                    y2={200 - ((12.5 - 2) / 12) * 170}
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </svg>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900">{activeQuartet.title}</div>
                <p className="text-slate-600 leading-relaxed">{activeQuartet.description}</p>
                <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-500 space-y-0.5">
                  <div>X 均值: 9.00 | Y 均值: 7.50</div>
                  <div>回归系数: y = 3.00 + 0.50x</div>
                  <div>Pearson r: 0.816 (高度一致)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trap 3 Interactive: Simpson's Paradox */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  实验 2：辛普森悖论 (Simpson's Paradox) 动态交互验证
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  全量样本下呈现负相关 ($r = {overallR.toFixed(2)}$)，但引入分组因子后，每个组内全部变为强正相关！
                </p>
              </div>

              <button
                onClick={() => setShowSimpsonGrouped(!showSimpsonGrouped)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  showSimpsonGrouped
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {showSimpsonGrouped ? '✓ 已开启分层观察 (解除悖论)' : '未分层全局观察 (陷入悖论)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-4">
              <div className="md:col-span-2">
                <svg viewBox="0 0 500 220" className="w-full h-auto select-none bg-white rounded-lg border border-slate-200">
                  {/* Scatter points */}
                  {simpsonData.map((pt, i) => {
                    const cx = 40 + ((pt.x - 5) / 60) * 420;
                    const cy = 200 - ((pt.y - 5) / 55) * 170;
                    let color = '#64748b';
                    if (showSimpsonGrouped) {
                      if (pt.group.includes('部门 A')) color = '#0284c7';
                      if (pt.group.includes('部门 B')) color = '#10b981';
                      if (pt.group.includes('部门 C')) color = '#f59e0b';
                    }

                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* If not grouped, draw single negative slope line */}
                  {!showSimpsonGrouped ? (
                    <line
                      x1="60"
                      y1="50"
                      x2="450"
                      y2="175"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  ) : (
                    /* Draw 3 positive slope lines */
                    <>
                      <line x1="70" y1="130" x2="160" y2="40" stroke="#0284c7" strokeWidth="2" />
                      <line x1="170" y1="155" x2="280" y2="85" stroke="#10b981" strokeWidth="2" />
                      <line x1="310" y1="185" x2="440" y2="120" stroke="#f59e0b" strokeWidth="2" />
                    </>
                  )}
                </svg>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div className="font-bold text-slate-900">
                  {showSimpsonGrouped ? '分层真实洞察：' : '全量全局误判：'}
                </div>
                {!showSimpsonGrouped ? (
                  <div className="text-rose-700 leading-relaxed">
                    <strong>虚假结论：</strong>变量 X 与 Y 呈现显著负相关 (r = {overallR.toFixed(2)})，
                    错误地得出“投入越多反而收益越低”的荒谬结论！
                  </div>
                ) : (
                  <div className="text-emerald-800 leading-relaxed space-y-1">
                    <div>
                      <strong>真实结论：</strong>在每个具体部门内部，X 对 Y 均为正向驱动：
                    </div>
                    <div>• 部门 A: r = {rA.toFixed(2)} (正相关)</div>
                    <div>• 部门 B: r = {rB.toFixed(2)} (正相关)</div>
                    <div>• 部门 C: r = {rC.toFixed(2)} (正相关)</div>
                  </div>
                )}
                <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-100">
                  警示：在未做因子分层 (grouping) 的情况下做全量统计，极易掉入辛普森悖论。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slice 4 */}
      {activeSlice === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片四：误区警示与系统 EDA 方法论闭环】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              警惕“EDA 只是随意的画图浏览”——系统的 EDA 是一套严密的统计探索闭环，旨在为后续的特征工程与模型选择奠定坚实的数据直觉与科学依据。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4">
              <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2 mb-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>常见 EDA 误区与随意操作</span>
              </h4>
              <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4">
                <li>
                  <strong>误区 1：</strong>一上来就直接把所有变量扔给 XGBoost / 深度神经网络拟合，未排查多重共线性与数据泄漏。
                </li>
                <li>
                  <strong>误区 2：</strong>仅报告均值与方差，未验证正态性与偏态，掩盖了严重的极端值绑架。
                </li>
                <li>
                  <strong>误区 3：</strong>随意剔除离群点，将重要的业务故障或黑天鹅信号当成“脏数据”抹去。
                </li>
              </ul>
            </div>

            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4">
              <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>科学的 EDA 四步标准闭环</span>
              </h4>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal pl-4">
                <li>
                  <strong>第 1 步 画像与完整性：</strong>核查行列规整性、字段类型、缺失机制 (MCAR/MAR)。
                </li>
                <li>
                  <strong>第 2 步 单变量形态诊断：</strong>偏度与峰度度量、KDE 核密度、评估对数与幂变换需求。
                </li>
                <li>
                  <strong>第 3 步 二元与高维关联：</strong>散点图矩阵、相关系数热力图、多重共线性 VIF 排查。
                </li>
                <li>
                  <strong>第 4 步 业务知识验证：</strong>结合实际领域经验与先验约束，形成特征工程候选方案。
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
