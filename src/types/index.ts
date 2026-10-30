export type DataType = 'numeric' | 'category' | 'date' | 'integer';

export interface ColumnProfile {
  name: string;
  type: DataType;
  rType: 'numeric' | 'integer' | 'factor' | 'character' | 'Date';
  totalCount: number;
  missingCount: number;
  missingRate: number; // 0 to 1
  uniqueCount: number;
  uniqueRate: number; // 0 to 1
  sampleValues: (string | number)[];
  // For numeric:
  mean?: number;
  sd?: number;
  min?: number;
  q25?: number;
  median?: number;
  q75?: number;
  max?: number;
  iqr?: number;
  skewness?: number;
  kurtosis?: number;
  cv?: number; // Coefficient of Variation = sd / mean
  trimmedMean?: number;
}

export interface Dataset {
  id: string;
  title: string;
  category: string;
  description: string;
  rows: number;
  cols: number;
  data: Record<string, any>[];
  targetCol?: string;
  groupCol?: string;
  insights: string[];
}

export interface CorrelationPair {
  var1: string;
  var2: string;
  pearson: number;
  spearman: number;
  isHighRisk: boolean; // |r| > 0.85
}

export interface DiagnosticAlert {
  type: 'skewness' | 'multicollinearity' | 'outlier' | 'simpson' | 'cardinality';
  severity: 'high' | 'medium' | 'info';
  title: string;
  variable?: string;
  variables?: [string, string];
  description: string;
  rSolution: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'heuristic';
}
