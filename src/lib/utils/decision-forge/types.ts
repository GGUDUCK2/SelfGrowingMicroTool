export interface Criterion {
  id: string;
  name: string;
  weight: number; // 1-10
}

export interface Option {
  id: string;
  name: string;
  scores: Record<string, number>; // key: criterionId, value: score (0-10)
}

export interface DecisionMatrixState {
  id?: number;
  name: string;
  criteria: Criterion[];
  options: Option[];
  createdAt?: Date;
}
