import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';
import { initialTools, tools } from 'Graphql/client/cache';

function useTools() {
  function addTool(toolName: keyof GetUserTools_project_toolUrls) {
    const { openedTools, currentTool } = tools();
    if (currentTool === toolName) return;

    const toolAlreadyOpened = openedTools.includes(toolName);
    if (!toolAlreadyOpened) {
      const newOpenedTools = [...openedTools, toolName];
      tools({ currentTool: toolName, openedTools: newOpenedTools });
    } else {
      tools({ currentTool: toolName, openedTools });
    }
  }

  function resetCurrentTool() {
    const { openedTools } = tools();
    tools({
      currentTool: null,
      openedTools,
    });
  }

  function resetTools() {
    tools(initialTools);
  }

  return { addTool, resetTools, resetCurrentTool };
}

export default useTools;
