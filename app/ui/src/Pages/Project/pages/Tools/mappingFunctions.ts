import { EnhancedTool, EnhancedToolGroups, toolsGroups } from './config';

import { GetProjectTools_project_toolUrls } from 'Graphql/queries/types/GetProjectTools';

export function mapTools(projectTools: GetProjectTools_project_toolUrls) {
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
