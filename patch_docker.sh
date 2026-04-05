sed -i 's/function handleRestore(item: any)/function handleRestore(item: ToolHistoryItem)/' src/lib/components/docker-forge/DockerBuilder.svelte
sed -i 's/import { smartSaveToHistory as workspaceSave } from '\''\$lib\/db\/workspace'\'';/import { smartSaveToHistory as workspaceSave, type ToolHistoryItem } from '\''\$lib\/db\/workspace'\'';/' src/lib/components/docker-forge/DockerBuilder.svelte
