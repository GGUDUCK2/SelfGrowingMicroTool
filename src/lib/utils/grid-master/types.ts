export interface GridArea {
  id: string;
  name: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  color: string;
}

export interface GridItem {
  id: string;
  areaId: string;
  content: string;
  style: Record<string, string>;
}

export interface GridState {
  rows: string[];
  cols: string[];
  gap: string;
  rowGap: string;
  colGap: string;
  areas: GridArea[];
  items: GridItem[];
}
