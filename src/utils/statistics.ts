import { ColumnProfile, CorrelationPair, DataType, DiagnosticAlert } from '../types';

/**
 * Basic Descriptive Statistics
 */
export function calculateMean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

export function calculateVariance(arr: number[], mean?: number): number {
  if (arr.length <= 1) return 0;
  const m = mean !== undefined ? mean : calculateMean(arr);
  const sumSq = arr.reduce((acc, val) => acc + (val - m) ** 2, 0);
  return sumSq / (arr.length - 1);
}

export function calculateSD(arr: number[], mean?: number): number {
  return Math.sqrt(calculateVariance(arr, mean));
}

export function calculateQuantile(sortedArr: number[], q: number): number {
  if (!sortedArr.length) return 0;
  if (sortedArr.length === 1) return sortedArr[0];
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  }
  return sortedArr[base];
}

export function calculateTrimmedMean(sortedArr: number[], trimRatio = 0.05): number {
  if (!sortedArr.length) return 0;
  const k = Math.floor(sortedArr.length * trimRatio);
  const trimmed = sortedArr.slice(k, sortedArr.length - k);
  return calculateMean(trimmed);
}

/**
 * Fisher-Pearson Skewness
 */
export function calculateSkewness(arr: number[], mean?: number, sd?: number): number {
  const n = arr.length;
  if (n < 3) return 0;
  const m = mean !== undefined ? mean : calculateMean(arr);
  const s = sd !== undefined ? sd : calculateSD(arr, m);
  if (s === 0) return 0;

  const m3 = arr.reduce((acc, x) => acc + Math.pow(x - m, 3), 0) / n;
  const factor = (Math.sqrt(n * (n - 1)) / (n - 2));
  return factor * (m3 / Math.pow(s, 3));
}

/**
 * Excess Kurtosis (Normal distribution = 0)
 */
export function calculateKurtosis(arr: number[], mean?: number, sd?: number): number {
  const n = arr.length;
  if (n < 4) return 0;
  const m = mean !== undefined ? mean : calculateMean(arr);
  const s = sd !== undefined ? sd : calculateSD(arr, m);
  if (s === 0) return 0;

  const m4 = arr.reduce((acc, x) => acc + Math.pow(x - m, 4), 0) / n;
  const rawKurt = m4 / Math.pow(s, 4);
  const factor1 = ((n - 1) / ((n - 2) * (n - 3)));
  const excess = factor1 * ((n + 1) * rawKurt - 3 * (n - 1));
  return excess;
}

/**
 * Gaussian Kernel Density Estimation (KDE)
 */
export function calculateKDE(
  data: number[],
  points = 60,
  customBandwidth?: number
): { x: number; density: number }[] {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min || 1;
  const pad = range * 0.1;
  const start = min - pad;
  const end = max + pad;
  const step = (end - start) / (points - 1);

  const n = data.length;
  const sd = calculateSD(data);
  const q25 = calculateQuantile(sorted, 0.25);
  const q75 = calculateQuantile(sorted, 0.75);
  const iqr = q75 - q25;

  // Silverman's Rule of Thumb
  const h =
    customBandwidth ||
    (0.9 * Math.min(sd, (iqr / 1.34) || sd || 1)) * Math.pow(n, -0.2) ||
    0.5;

  const results: { x: number; density: number }[] = [];
  const sqrt2pi = Math.sqrt(2 * Math.PI);

  for (let i = 0; i < points; i++) {
    const x = start + i * step;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const u = (x - data[j]) / h;
      sum += Math.exp(-0.5 * u * u) / sqrt2pi;
    }
    const density = sum / (n * h);
    results.push({ x, density });
  }

  return results;
}

/**
 * Standard Normal Inverse CDF Approximation (Acklam's algorithm)
 */
export function normalInverseCDF(p: number): number {
  if (p <= 0) return -3.8;
  if (p >= 1) return 3.8;

  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/**
 * Generate Q-Q Plot Coordinates
 */
export function calculateQQPlotData(data: number[]): { theoretical: number; sample: number }[] {
  if (data.length === 0) return [];
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const points: { theoretical: number; sample: number }[] = [];

  for (let i = 0; i < n; i++) {
    // Blom's plotting position: (i - 0.375) / (n + 0.25)
    const p = (i + 1 - 0.375) / (n + 0.25);
    const theoretical = normalInverseCDF(p);
    points.push({ theoretical, sample: sorted[i] });
  }

  return points;
}

/**
 * Pearson Correlation
 */
export function calculatePearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n <= 1) return 0;
  const meanX = calculateMean(x.slice(0, n));
  const meanY = calculateMean(y.slice(0, n));
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const denom = Math.sqrt(denX * denY);
  return denom === 0 ? 0 : num / denom;
}

/**
 * Spearman Rank Correlation
 */
export function calculateSpearman(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n <= 1) return 0;

  const rank = (arr: number[]) => {
    const indexed = arr.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => a.val - b.val);
    const ranks = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j < n - 1 && indexed[j + 1].val === indexed[j].val) {
        j++;
      }
      const avgRank = (i + j + 2) / 2;
      for (let k = i; k <= j; k++) {
        ranks[indexed[k].idx] = avgRank;
      }
      i = j + 1;
    }
    return ranks;
  };

  const rankX = rank(x.slice(0, n));
  const rankY = rank(y.slice(0, n));
  return calculatePearson(rankX, rankY);
}

/**
 * Profile an entire dataset
 */
export function profileDataset(data: Record<string, any>[]): ColumnProfile[] {
  if (!data.length) return [];
  const keys = Object.keys(data[0]);
  const totalRows = data.length;

  return keys.map((key) => {
    const values = data.map((d) => d[key]);
    const validValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    const missingCount = totalRows - validValues.length;
    const missingRate = missingCount / totalRows;

    const uniqueSet = new Set(validValues);
    const uniqueCount = uniqueSet.size;
    const uniqueRate = uniqueCount / totalRows;

    // Detect type
    const numericValues = validValues
      .map((v) => (typeof v === 'number' ? v : Number(v)))
      .filter((v) => !isNaN(v));

    const isNumeric = numericValues.length / (validValues.length || 1) >= 0.85 && uniqueCount > 5;
    const isInteger = isNumeric && numericValues.every((v) => Number.isInteger(v));
    const isDate =
      !isNumeric &&
      validValues.slice(0, 10).every((v) => !isNaN(Date.parse(String(v))) && isNaN(Number(v)));

    let type: DataType = 'category';
    let rType: ColumnProfile['rType'] = 'character';

    if (isNumeric) {
      if (isInteger && uniqueCount <= 20) {
        type = 'integer';
        rType = 'integer';
      } else {
        type = 'numeric';
        rType = 'numeric';
      }
    } else if (isDate) {
      type = 'date';
      rType = 'Date';
    } else {
      type = 'category';
      rType = uniqueCount <= 10 ? 'factor' : 'character';
    }

    const profile: ColumnProfile = {
      name: key,
      type,
      rType,
      totalCount: totalRows,
      missingCount,
      missingRate,
      uniqueCount,
      uniqueRate,
      sampleValues: validValues.slice(0, 5),
    };

    if (isNumeric && numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const mean = calculateMean(sorted);
      const sd = calculateSD(sorted, mean);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const q25 = calculateQuantile(sorted, 0.25);
      const median = calculateQuantile(sorted, 0.5);
      const q75 = calculateQuantile(sorted, 0.75);
      const iqr = q75 - q25;
      const skewness = calculateSkewness(sorted, mean, sd);
      const kurtosis = calculateKurtosis(sorted, mean, sd);
      const cv = mean !== 0 ? Math.abs(sd / mean) : 0;
      const trimmedMean = calculateTrimmedMean(sorted, 0.05);

      profile.mean = mean;
      profile.sd = sd;
      profile.min = min;
      profile.max = max;
      profile.q25 = q25;
      profile.median = median;
      profile.q75 = q75;
      profile.iqr = iqr;
      profile.skewness = skewness;
      profile.kurtosis = kurtosis;
      profile.cv = cv;
      profile.trimmedMean = trimmedMean;
    }

    return profile;
  });
}

/**
 * Generate Correlation Matrix for numeric columns
 */
export function computeCorrelationMatrix(
  data: Record<string, any>[],
  profiles: ColumnProfile[]
): {
  columns: string[];
  matrix: number[][];
  spearmanMatrix: number[][];
  pairs: CorrelationPair[];
} {
  const numCols = profiles
    .filter((p) => p.type === 'numeric' || p.type === 'integer')
    .map((p) => p.name);

  const n = numCols.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const spearmanMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const pairs: CorrelationPair[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
        spearmanMatrix[i][j] = 1;
      } else if (i < j) {
        const col1 = numCols[i];
        const col2 = numCols[j];
        const validPairs = data
          .map((row) => ({ x: Number(row[col1]), y: Number(row[col2]) }))
          .filter((pt) => !isNaN(pt.x) && !isNaN(pt.y));

        const xVals = validPairs.map((p) => p.x);
        const yVals = validPairs.map((p) => p.y);

        const pVal = calculatePearson(xVals, yVals);
        const sVal = calculateSpearman(xVals, yVals);

        matrix[i][j] = pVal;
        matrix[j][i] = pVal;
        spearmanMatrix[i][j] = sVal;
        spearmanMatrix[j][i] = sVal;

        pairs.push({
          var1: col1,
          var2: col2,
          pearson: pVal,
          spearman: sVal,
          isHighRisk: Math.abs(pVal) >= 0.85,
        });
      }
    }
  }

  // Sort pairs by absolute pearson correlation desc
  pairs.sort((a, b) => Math.abs(b.pearson) - Math.abs(a.pearson));

  return { columns: numCols, matrix, spearmanMatrix, pairs };
}

/**
 * Rule-based Diagnostic Scanner
 */
export function scanDiagnosticAlerts(
  profiles: ColumnProfile[],
  pairs: CorrelationPair[]
): DiagnosticAlert[] {
  const alerts: DiagnosticAlert[] = [];

  // 1. Right Skewness check
  profiles.forEach((p) => {
    if (p.skewness !== undefined && p.skewness > 1.2 && p.min !== undefined && p.min >= 0) {
      alerts.push({
        type: 'skewness',
        severity: p.skewness > 2.0 ? 'high' : 'medium',
        title: `严重右偏长尾分布：${p.name} (偏度 = ${p.skewness.toFixed(2)})`,
        variable: p.name,
        description: `变量 ${p.name} 呈现显著的长尾分布，大多数数据挤压在低值区间，极少数超大值拉高均值。未做对数变换可能导致线性回归残差异方差，削弱机器学习模型泛化能力。`,
        rSolution: `df$${p.name}_log <- log1p(df$${p.name})\nggplot(df, aes(x = ${p.name}_log)) + geom_density(fill="skyblue", alpha=0.5)`,
      });
    }
  });

  // 2. Multicollinearity risk (|r| > 0.85)
  pairs.forEach((pair) => {
    if (pair.isHighRisk) {
      alerts.push({
        type: 'multicollinearity',
        severity: 'high',
        title: `高相关性/多重共线性风险：${pair.var1} 与 ${pair.var2} (r = ${pair.pearson.toFixed(2)})`,
        variables: [pair.var1, pair.var2],
        description: `两变量间皮尔逊相关系数高达 ${pair.pearson.toFixed(2)}。在多元回归中同时引入二者会引发严重的共线性问题（方差膨胀系数 VIF 激增），导致系数估计极其不稳定。`,
        rSolution: `library(car)\nmodel <- lm(target ~ ., data = df)\nvif(model) # 若 VIF > 5-10，建议剔除其一或通过 PCA 主成分降维`,
      });
    }
  });

  // 3. Outlier leverage vs median
  profiles.forEach((p) => {
    if (
      p.mean !== undefined &&
      p.median !== undefined &&
      p.sd !== undefined &&
      p.iqr !== undefined &&
      p.median !== 0
    ) {
      const ratio = Math.abs((p.mean - p.median) / p.median);
      if (ratio > 0.35 && p.iqr > 0) {
        alerts.push({
          type: 'outlier',
          severity: 'medium',
          title: `均值被极端离群点绑架：${p.name} (均值/中位数差率 ${(ratio * 100).toFixed(0)}%)`,
          variable: p.name,
          description: `变量 ${p.name} 的均值 (${p.mean.toFixed(2)}) 与中位数 (${p.median.toFixed(2)}) 出现严重脱节，说明长尾中的离群点具有极强的统计杠杆效应，传统均值不再具备代表性。`,
          rSolution: `# 计算稳健统计量与 Tukey 箱线图离群点检测\noutliers <- boxplot.stats(df$${p.name})$out\ncat("检测到极端离群样本数:", length(outliers))`,
        });
      }
    }
  });

  return alerts;
}

/**
 * Anscombe's Quartet data generator for Slice 3
 */
export function getAnscombesQuartet() {
  return [
    {
      id: 'I',
      title: '数据集 I：经典线性平稳关系',
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
      description: '标准线性关系，残差服从正态分布。',
    },
    {
      id: 'II',
      title: '数据集 II：典型非线性倒U型关系',
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
      description: '具有完全相同的均值、方差与 r=0.82，但图形为二次抛物线！',
    },
    {
      id: 'III',
      title: '数据集 III：单一严重离群点拉扯',
      x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
      y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
      description: '本质是极其严格的纯直线，但仅被 1 个异常点 (13, 12.74) 严重歪曲。',
    },
    {
      id: 'IV',
      title: '数据集 IV：极端高杠杆点 (Leverage Point)',
      x: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 19],
      y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 5.56, 7.91, 6.89, 12.5],
      description: '除 1 个离群点 x=19 外，所有样本的 x 均为 8！仅靠单点决定了整条回归线。',
    },
  ];
}

/**
 * Simpson's Paradox Dataset generator
 */
export function getSimpsonsParadoxDemo() {
  // Overall correlation is negative, but within each group (Group A, Group B, Group C) correlation is positive!
  const groupA = [
    { x: 10, y: 30, group: '部门 A (高研发投入)' },
    { x: 12, y: 35, group: '部门 A (高研发投入)' },
    { x: 15, y: 40, group: '部门 A (高研发投入)' },
    { x: 18, y: 46, group: '部门 A (高研发投入)' },
    { x: 20, y: 52, group: '部门 A (高研发投入)' },
    { x: 22, y: 58, group: '部门 A (高研发投入)' },
  ];
  const groupB = [
    { x: 25, y: 20, group: '部门 B (常规运营组)' },
    { x: 28, y: 24, group: '部门 B (常规运营组)' },
    { x: 30, y: 29, group: '部门 B (常规运营组)' },
    { x: 33, y: 33, group: '部门 B (常规运营组)' },
    { x: 36, y: 38, group: '部门 B (常规运营组)' },
    { x: 40, y: 42, group: '部门 B (常规运营组)' },
  ];
  const groupC = [
    { x: 45, y: 10, group: '部门 C (传统外包组)' },
    { x: 48, y: 14, group: '部门 C (传统外包组)' },
    { x: 50, y: 18, group: '部门 C (传统外包组)' },
    { x: 54, y: 22, group: '部门 C (传统外包组)' },
    { x: 58, y: 26, group: '部门 C (传统外包组)' },
    { x: 62, y: 31, group: '部门 C (传统外包组)' },
  ];

  return [...groupA, ...groupB, ...groupC];
}
