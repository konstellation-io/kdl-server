import { Route } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import React, { useEffect } from 'react';
import Tools from '../../pages/Tools/Tools';
import useTools from 'Graphql/client/hooks/useTools';

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
      <Route
        exact
        path={ROUTE.PROJECT_TOOL_GITEA}
        component={() => <Tools toolName="gitea" />}
      />
      <Route
        exact
        path={ROUTE.PROJECT_TOOL_DRONE}
        component={() => <Tools toolName="drone" />}
      />
      <Route
        exact
        path={ROUTE.PROJECT_TOOL_JUPYTER}
        component={() => <Tools toolName="jupyter" />}
      />
      <Route
        exact
        path={ROUTE.PROJECT_TOOL_MINIO}
        component={() => <Tools toolName="minio" />}
      />
      <Route
        exact
        path={ROUTE.PROJECT_TOOL_MLFLOW}
        component={() => <Tools toolName="mlflow" />}
      />
      <Route
        exact
        path={ROUTE.PROJECT_TOOL_VSCODE}
        component={() => <Tools toolName="vscode" />}
      />
    </>
  );
}

export default ProjectToolsRoutes;
