import { workspaceDB } from './workspace';

export interface HashForgeHistoryItem {
  type: 'text' | 'file' | 'hmac';
  inputName: string; // The text content (truncated), file name, or HMAC message
  fullMessage?: string; // Original full text message
  inputFormat?: string; // e.g. text, hex, base64
  secret?: string; // Original secret for HMAC
  secretFormat?: string; // e.g. text, hex, base64
  algorithm: string;
  salt?: string;
  saltPosition?: 'prepend' | 'append';
  isSaltEnabled?: boolean;
  result: string; // Hex result
  base64Result?: string; // Base64 result
}

export const TOOL_ID = 'hash-forge';

export const saveToHistory = async (item: HashForgeHistoryItem) => {
  try {
    await workspaceDB.history.add({
      toolId: TOOL_ID,
      input: item,
      timestamp: Date.now(),
      starred: false,
    });
  } catch (error) {
    console.error('Failed to save to Hash Forge history:', error);
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
  const unstarredIds = items.filter(item => !item.starred).map(item => item.id!);
  return workspaceDB.history.bulkDelete(unstarredIds);
};
