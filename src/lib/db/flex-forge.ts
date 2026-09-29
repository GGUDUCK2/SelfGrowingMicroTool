export interface FlexContainerProps {
  flexDirection: "row" | "row-reverse" | "column" | "column-reverse";
  flexWrap: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  alignItems: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  alignContent: "stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
  gap: string;
}

export interface FlexItemProps {
  id: string;
  order: string;
  flexGrow: string;
  flexShrink: string;
  flexBasis: string;
  alignSelf: "auto" | "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  width: string;
  height: string;
  text: string;
}

export interface FlexForgeHistoryItem {
  id?: number;
  containerProps: FlexContainerProps;
  items: FlexItemProps[];
  createdAt: number;
  starred: boolean;
}
