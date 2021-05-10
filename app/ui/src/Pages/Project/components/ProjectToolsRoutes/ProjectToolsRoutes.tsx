import { Route } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import React, { useEffect } from 'react';
import Tools from '../../pages/Tools/Tools';
import useTools from 'Graphql/client/hooks/useTools';
import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';

const toolsRoutes: [ROUTE, keyof GetUserTools_project_toolUrls][] = [
  [ROUTE.PROJECT_TOOL_GITEA, 'gitea'],
  [ROUTE.PROJECT_TOOL_DRONE, 'drone'],
  [ROUTE.PROJECT_TOOL_JUPYTER, 'jupyter'],
  [ROUTE.PROJECT_TOOL_FILEBROWSER, 'filebrowser'],
  [ROUTE.PROJECT_TOOL_MLFLOW, 'mlflow'],
  [ROUTE.PROJECT_TOOL_VSCODE, 'vscode'],
];
function ProjectToolsRoutes() {
  const { resetCurrentTool } = useTools();

  useEffect(
    () => () => resetCurrentTool(),
    // We want to call this on component unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      {toolsRoutes.map(([route, toolName]) => (
        <Route
          key={toolName}
          path={route}
          component={() => <Tools toolName={toolName} />}
          exact
        />
      ))}
    </>
  );
}

export default ProjectToolsRoutes;
