import { EnhancedTool, EnhancedToolGroups, toolsGroups } from './config';

import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';

export function mapTools(projectTools: GetUserTools_project_toolUrls) {
  const mappedToolsGroups: EnhancedToolGroups[] = toolsGroups.map(
    (toolGroup) => {
      const tools: EnhancedTool[] = toolGroup.tools.map((tool) => {
        if (!projectTools[tool.name]) {
          console.error(`Unknown tool "${tool.name}"`);
        }

        return {
          ...tool,
          url: projectTools[tool.name] || '',
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
