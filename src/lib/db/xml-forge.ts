import { workspaceDB } from './workspace';

export interface XmlForgeHistoryItem {
  id?: number;
  input: string;
  output: string;
  mode: 'xml-to-json' | 'json-to-xml' | 'format';
  timestamp?: number;
  starred?: boolean;
}

export const TOOL_ID = 'xml-forge';

export const saveToHistory = async (item: XmlForgeHistoryItem) => {
  try {
    await workspaceDB.history.add({
      toolId: TOOL_ID,
      input: item,
      timestamp: Date.now(),
      starred: false,
    });
  } catch (error) {
    console.error('Failed to save to Xml Forge history:', error);
  }
};

export const getHistory = async () => {
  return workspaceDB.history
    .where('toolId')
    .equals(TOOL_ID)
    .reverse()
    .sortBy('timestamp');
};

export const toggleStar = async (id: number, currentStarred: boolean) => {
  return workspaceDB.history.update(id, { starred: !currentStarred });
};

export const deleteFromHistory = async (id: number) => {
  return workspaceDB.history.delete(id);
};

export const clearHistory = async () => {
  const items = await getHistory();
  const unstarredIds = items.filter((item: any) => !item.starred).map((item: any) => item.id!);
  return workspaceDB.history.bulkDelete(unstarredIds);
};
