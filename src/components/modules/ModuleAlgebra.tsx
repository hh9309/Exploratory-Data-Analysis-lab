import React, { useState, useMemo } from 'react';
import { Sigma, BookOpen, Sparkles, Layers, Sliders, CheckCircle2, RefreshCw } from 'lucide-react';

export const ModuleAlgebra: React.FC = () => {
  // Interactive Simulation State
  const [sampleSize, setSampleSize] = useState<number>(60);
  const [distType, setDistType] = useState<'normal' | 'lognormal' | 'bimodal'>('lognormal');
  const [seed, setSeed] = useState<number>(1);

  // Generate synthetic sample based on distribution
  const simulatedData = useMemo(() => {
    const data: number[] = [];
    for (let i = 0; i < sampleSize; i++) {
      // pseudo-random with seed
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      // Box-Muller normal
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      if (distType === 'normal') {
        data.push(50 + z * 10);
      } else if (distType === 'lognormal') {
        data.push(Math.exp(2.8 + z * 0.7)); // heavily skewed
      } else {
        // bimodal: 50% from N(30, 5), 50% from N(70, 7)
        if (Math.random() < 0.5) {
          data.push(30 + z * 5);
        } else {
          data.push(70 + z * 7);
        }
      }
    }
    return data.sort((a, b) => a - b);
  }, [sampleSize, distType, seed]);

  // Compute Empirical CDF vs True CDF
  const minVal = simulatedData[0] || 0;
  const maxVal = simulatedData[simulatedData.length - 1] || 100;
  const range = maxVal - minVal || 1;

  // Step points for empirical CDF
  const ecdfPoints = useMemo(() => {
    const n = simulatedData.length;
    return simulatedData.map((val, idx) => ({
      x: val,
      y: (idx + 1) / n,
    }));
  }, [simulatedData]);

  // Sample Moments
  const sampleMean = simulatedData.reduce((a, b) => a + b, 0) / (simulatedData.length || 1);
  const sampleVar =
    simulatedData.reduce((a, b) => a + (b - sampleMean) ** 2, 0) / (simulatedData.length - 1 || 1);
  const sampleSD = Math.sqrt(sampleVar);

  const sampleSkewness =
    simulatedData.reduce((a, b) => a + ((b - sampleMean) / sampleSD) ** 3, 0) /
    (simulatedData.length || 1);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-medium mb-2 border border-sky-200">
              <Sigma className="w-3.5 h-3.5 text-sky-600" />
              <span>核心模块 01 · 统计基础与形式化体系</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              探索性数据分析代数与统计推断建模 (Exploratory Algebra)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              形式化构建单变量特征空间 X 与联合概率分布 P(X) 的代数描述模型。揭示
              EDA 在正式统计假设检验或机器学习建模前，如何通过经验分布与无偏泛函捕获真实的先验知识。
            </p>
          </div>
        </div>
      </div>

      {/* 3 Core Mathematical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm mb-3">
              01
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              特征分布空间与经验测度
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              设样本点独立同分布采集自真实测度空间 (Ω, F, P)，EDA
              首先通过经验累积分布函数（Empirical CDF）对母体分布进行非参数逼近：
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3 font-mono text-xs text-slate-800">
              Fn(t) = (1/n) · ∑ I(Xi ≤ t)
            </div>
            <p className="text-xs text-slate-500">
              <strong className="text-slate-700">格利文科-坎泰利定理 (Glivenko-Cantelli)：</strong>
              当 n → ∞ 时，sup |Fn(t) - F(t)| 几乎必然收敛于 0 (Almost Surely)，即经验分布具备大样本强一致性。
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
              02
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              统计泛函映射与矩生成
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              EDA 将无限维分布测度映射至有限维统计量空间 θ(F)。中心趋势与高阶离散矩表征分布形态：
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3 font-mono text-xs text-slate-800 space-y-1">
              <div>μ = E[X],  σ² = E[(X - μ)²]</div>
              <div>Skew = E[(X - μ)³] / σ³,  Kurt = E[(X - μ)⁴] / σ⁴ - 3</div>
            </div>
            <p className="text-xs text-slate-500">
              当 Skew &gt; 1.0 时，传统均值受高阶矩拉扯失真，必须引入分位数泛函 Q(p) = F⁻¹(p)。
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
              03
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">
              先验知识捕获与假设空间剪枝
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              在正式拟合高阶参数模型前，EDA 通过信息熵与相关性先验避免过拟合与模型误设：
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3 font-mono text-xs text-slate-800">
              D_KL(P ‖ Q) = ∫ p(x) · log( p(x) / q_θ(x) ) dx
            </div>
            <p className="text-xs text-slate-500">
              通过识别双峰（潜变量混合）、长尾极端值与非线性拓扑，将参数搜索空间有效收敛至可识别域。
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Algebra Simulator: Empirical CDF vs Prior Convergence */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>经验分布函数 (ECDF) 与先验收敛交互模拟器</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              实时调整样本容量 $n$ 与理论生成分布，观察经验测度 $F_n(x)$ 的阶梯收敛轨迹
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">生成过程:</span>
              <select
                value={distType}
                onChange={(e) => setDistType(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium outline-hidden focus:border-sky-500"
              >
                <option value="lognormal">对数正态 (严重右偏厚尾)</option>
                <option value="normal">高斯正态 N(50, 100)</option>
                <option value="bimodal">双峰混合高斯 (含潜变量)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">样本量 n:</span>
              <input
                type="range"
                min="15"
                max="300"
                step="5"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-24 accent-sky-600"
              />
              <span className="font-mono font-bold text-sky-700 w-8">{sampleSize}</span>
            </div>

            <button
              onClick={() => setSeed((s) => s + 1)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重抽样
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <div className="relative">
              <svg viewBox="0 0 540 240" className="w-full h-auto select-none bg-slate-50/50 rounded-lg border border-slate-100">
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                  const y = 20 + 180 * (1 - p);
                  return (
                    <g key={p}>
                      <line x1="45" y1={y} x2="520" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x="38" y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
                        {p.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* ECDF Step Line */}
                {ecdfPoints.map((pt, i) => {
                  const prevX = i === 0 ? 45 : 45 + ((ecdfPoints[i - 1].x - minVal) / range) * 470;
                  const curX = 45 + ((pt.x - minVal) / range) * 470;
                  const curY = 20 + 180 * (1 - pt.y);
                  const prevY = i === 0 ? 200 : 20 + 180 * (1 - ecdfPoints[i - 1].y);

                  return (
                    <g key={i}>
                      {/* Horizontal segment */}
                      <line x1={prevX} y1={prevY} x2={curX} y2={prevY} stroke="#0284c7" strokeWidth="2" />
                      {/* Vertical step */}
                      <line x1={curX} y1={prevY} x2={curX} y2={curY} stroke="#0284c7" strokeWidth="2" />
                    </g>
                  );
                })}

                {/* Median marker (p=0.5) */}
                <line x1="45" y1="110" x2="520" y2="110" stroke="#7c3aed" strokeDasharray="4 3" strokeWidth="1.2" />
                <text x="515" y="105" textAnchor="end" fontSize="10" fill="#7c3aed" fontWeight="bold">
                  中位数分位线 P=0.5
                </text>

                {/* X axis */}
                <line x1="45" y1="200" x2="520" y2="200" stroke="#94a3b8" />
                <text x="45" y="218" textAnchor="start" fontSize="10" fill="#64748b">
                  最小值 {minVal.toFixed(1)}
                </text>
                <text x="520" y="218" textAnchor="end" fontSize="10" fill="#64748b">
                  最大值 {maxVal.toFixed(1)}
                </text>
              </svg>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2">
              <span>横轴: 随机变量观测取值 x ∈ X</span>
              <span>纵轴: 经验累积概率 Fn(x) ∈ [0, 1]</span>
            </div>
          </div>

          {/* Real-time Moment Calculus Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              当前生成子空间的实测代数量
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600">样本一阶中心矩 (均值 $\mu$):</span>
                <span className="font-mono font-bold text-slate-900">{sampleMean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600">样本二阶标准差 ($\sigma$):</span>
                <span className="font-mono font-bold text-slate-900">{sampleSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600">样本三阶偏度 (Skewness):</span>
                <span
                  className={`font-mono font-bold ${
                    sampleSkewness > 1 ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {sampleSkewness.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-600">变异系数 (CV = $\sigma/\mu$):</span>
                <span className="font-mono font-bold text-slate-900">
                  {(sampleSD / (sampleMean || 1)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-xs text-sky-800 leading-relaxed">
              <span className="font-semibold block mb-0.5">💡 代数推导洞察：</span>
              {distType === 'lognormal' &&
                '对数正态在经验分布中呈现强烈的陡升与超长右侧平缓延伸，证实低阶均值估计严重受制于尾部单一样本。'}
              {distType === 'normal' &&
                '正态分布在中值点 0.5 处斜率最大，上下对称，标准差与 IQR 比率接近常数 1.349。'}
              {distType === 'bimodal' &&
                '双峰分布在 ECDF 上呈现明显的“双阶跃”台阶特征，直接否定了单峰对称的高斯先验假设！'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
