import { EnhancedTool, EnhancedToolGroups, toolsGroups } from './config';
import { GetProjectTools_project_tools } from 'Graphql/queries/types/GetProjectTools';

export function mapTools(projectTools: GetProjectTools_project_tools[]) {
  const mappedToolsGroups: EnhancedToolGroups[] = toolsGroups.map(
    (toolGroup) => {
      const tools: EnhancedTool[] = toolGroup.tools.map((tool) => {
        const selectedTool = projectTools.find(
          (t) => t.toolName === tool.toolName
        );
        return {
          ...tool,
          url: selectedTool?.url || '',
        };
      });
      return {
        ...toolGroup,
        tools,
      };
    }
  );
  return mappedToolsGroups;
}
