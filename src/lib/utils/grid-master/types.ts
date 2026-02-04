import type { dictionaries } from '$lib/dictionaries';

export type JustifyItems = 'start' | 'end' | 'center' | 'stretch';
export type AlignItems = 'start' | 'end' | 'center' | 'stretch';
export type JustifyContent = 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
export type AlignContent = 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';

export interface GridArea {
  id: string;
  name: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  color: string;
  tag?: string; // header, footer, main, nav, section, aside, div
  contentType?: string; // chart, table, video, form, hero, etc.
  mobileOrder?: number; // Order in mobile stack view
  // Individual area alignment (optional for future)
  justifySelf?: JustifyItems;
  alignSelf?: AlignItems;
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

  // Container Alignment
  justifyItems: JustifyItems;
  alignItems: AlignItems;
  justifyContent: JustifyContent;
  alignContent: AlignContent;

  // Responsive
  includeMobile: boolean;
  mobileStrategy?: 'stack' | 'hide-sidebar';
}

export type GridMasterDictionary = typeof dictionaries.en.tools.gridMaster;
