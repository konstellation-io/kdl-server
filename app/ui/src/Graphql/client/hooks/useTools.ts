import { currentTool, openedTools } from 'Graphql/client/cache';

import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';

function useTools() {
  function addTool(toolName: keyof GetUserTools_project_toolUrls) {
    if (currentTool() === toolName) return;

    const toolAlreadyOpened = openedTools().includes(toolName);
    if (!toolAlreadyOpened) {
      openedTools([...openedTools(), toolName]);
    }

    currentTool(toolName);
  }

  function resetCurrentTool() {
    currentTool(null);
  }

  function resetTools() {
    currentTool(null);
    openedTools([]);
  }

  return { addTool, resetTools, resetCurrentTool };
}

export default useTools;
