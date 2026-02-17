export interface LogicForgeHistory {
  id?: number;
  expression: string;
  result?: string;
  type: 'truth-table' | 'simplify' | 'eval';
  createdAt: Date;
  starred?: number;
}

export type LogicAST =
  | { type: 'VAR'; name: string }
  | { type: 'CONST'; value: boolean }
  | { type: 'NOT'; operand: LogicAST }
  | { type: 'AND'; left: LogicAST; right: LogicAST }
  | { type: 'OR'; left: LogicAST; right: LogicAST }
  | { type: 'XOR'; left: LogicAST; right: LogicAST }
  | { type: 'NAND'; left: LogicAST; right: LogicAST }
  | { type: 'NOR'; left: LogicAST; right: LogicAST }
  | { type: 'XNOR'; left: LogicAST; right: LogicAST }
  | { type: 'IMPLIES'; left: LogicAST; right: LogicAST }
  | { type: 'EQUIV'; left: LogicAST; right: LogicAST };

export interface TruthTableData {
  variables: string[];
  rows: { values: boolean[]; result: boolean }[];
}

export interface KarnaughMapData {
  variables: string[];
  grid: (boolean | null)[][]; // null for 'don't care' if we support it later, or just 0/1
  rowLabels: string[];
  colLabels: string[];
  groups?: {
    cells: [number, number][]; // [row, col]
    color: string;
    term: string;
  }[];
}
