import ROUTE, { buildRoute } from 'Constants/routes';
import { useCallback, useMemo } from 'react';

import DroneIcon from 'Components/Icons/DroneIcon/DroneIcon';
import { GetMe } from 'Graphql/queries/types/GetMe';
import GiteaIcon from 'Components/Icons/GiteaIcon/GiteaIcon';
import IconHome from '@material-ui/icons/Dashboard';
import IconKG from '@material-ui/icons/EmojiObjects';
import JupyterIcon from 'Components/Icons/JupyterIcon/JupyterIcon';
import MlFlowIcon from 'Components/Icons/MlFlowIcon/MlFlowIcon';
import FolderIcon from '@material-ui/icons/Folder';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import VSIcon from 'Components/Icons/VSIcon/VSIcon';
import { useQuery, useReactiveVar } from '@apollo/client';
import { CONFIG } from 'index';

import GetMeQuery from 'Graphql/queries/getMe';
import { runningRuntime } from '../Graphql/client/cache';

export interface RouteConfiguration {
  id: string;
  label: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  disabled?: boolean;
  route: ROUTE;
}

export const mainRoutesConfig: RouteConfiguration[] = [
  {
    id: 'overview',
    label: 'Overview',
    Icon: IconHome,
    route: ROUTE.PROJECT_OVERVIEW,
  },
];
export const projectToolsRoutesConfig: RouteConfiguration[] = [
  {
    id: 'knowledgeGalaxy',
    label: 'Knowledge Galaxy',
    Icon: IconKG,
    route: ROUTE.PROJECT_TOOL_KG,
  },
  {
    id: 'gitea',
    label: 'Gitea',
    Icon: GiteaIcon,
    route: ROUTE.PROJECT_TOOL_GITEA,
  },
  {
    id: 'drone',
    route: ROUTE.PROJECT_TOOL_DRONE,
    label: 'Drone',
    Icon: DroneIcon,
  },
  {
    id: 'filebrowser',
    route: ROUTE.PROJECT_TOOL_FILEBROWSER,
    label: 'Filebrowser',
    Icon: FolderIcon,
  },
  {
    id: 'mlflow',
    route: ROUTE.PROJECT_TOOL_MLFLOW,
    label: 'Mlflow',
    Icon: MlFlowIcon,
  },
];

export const userToolsRoutesConfig: RouteConfiguration[] = [
  {
    id: 'jupyter',
    route: ROUTE.PROJECT_TOOL_JUPYTER,
    label: 'Jupyter',
    Icon: JupyterIcon,
  },
  {
    id: 'vscode',
    route: ROUTE.PROJECT_TOOL_VSCODE,
    label: 'Vscode',
    Icon: VSIcon,
  },
];

export interface RoutesConfiguration {
  allRoutes: RouteConfiguration[];
  mainRoutes: RouteConfiguration[];
  userToolsRoutes: RouteConfiguration[];
  projectToolsRoutes: RouteConfiguration[];
}

function useProjectNavigation(projectId: string): RoutesConfiguration {
  const runtimeRunning = useReactiveVar(runningRuntime);

  const buildRoutes = useCallback(
    (route: RouteConfiguration) =>
      ({
        ...route,
        route: buildRoute(route.route, projectId),
      } as RouteConfiguration),
    [projectId],
  );

  return useMemo(() => {
    const disabled = !runtimeRunning;
    const userToolsRoutesDisabled = userToolsRoutesConfig.map((route) => ({
      ...route,
      disabled,
    }));

    const userToolsRoutes = userToolsRoutesDisabled.map(buildRoutes);
    let projectToolsRoutes = projectToolsRoutesConfig.map(buildRoutes);
    const mainRoutes = mainRoutesConfig.map(buildRoutes);

    if (!CONFIG.KNOWLEDGE_GALAXY_ENABLED) {
      projectToolsRoutes = projectToolsRoutes.map((r: RouteConfiguration) =>
        r.id === 'knowledgeGalaxy' ? { ...r, disabled: true } : r,
      );
    }

    return {
      allRoutes: [...mainRoutes, ...projectToolsRoutes, ...userToolsRoutes],
      mainRoutes,
      projectToolsRoutes,
      userToolsRoutes,
    };
  }, [buildRoutes, runtimeRunning]);
}

export default useProjectNavigation;
