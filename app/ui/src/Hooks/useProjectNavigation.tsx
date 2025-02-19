import ROUTE, { buildRoute } from 'Constants/routes';
import { useCallback, useMemo } from 'react';

import IconHome from '@material-ui/icons/Dashboard';
import IconKG from '@material-ui/icons/EmojiObjects';
import MlFlowIcon from 'Components/Icons/MlFlowIcon/MlFlowIcon';
import FolderIcon from '@material-ui/icons/Folder';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import { useReactiveVar } from '@apollo/client';

import { loadingRuntime, runningRuntime, openedProject } from '../Graphql/client/cache';

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
  {
    id: 'minio',
    route: ROUTE.PROJECT_TOOL_MINIO,
    label: 'Minio',
    Icon: FolderIcon,
  },
];

export const userToolsRoutesConfig: RouteConfiguration[] = [];

export interface RoutesConfiguration {
  allRoutes: RouteConfiguration[];
  mainRoutes: RouteConfiguration[];
  userToolsRoutes: RouteConfiguration[];
  projectToolsRoutes: RouteConfiguration[];
}

function useProjectNavigation(projectId: string): RoutesConfiguration {
  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeLoading = useReactiveVar(loadingRuntime);
  const project = useReactiveVar(openedProject);

  const buildRoutes = useCallback(
    (route: RouteConfiguration) =>
      ({
        ...route,
        route: buildRoute(route.route, projectId),
      } as RouteConfiguration),
    [projectId],
  );

  return useMemo(() => {
    const disabled = !runtimeRunning || runtimeLoading !== null;
    const userToolsRoutesDisabled = userToolsRoutesConfig.map((route) => ({
      ...route,
      disabled,
    }));

    const userToolsRoutes = userToolsRoutesDisabled.map(buildRoutes);
    let projectToolsRoutes = projectToolsRoutesConfig.map(buildRoutes);
    const mainRoutes = mainRoutesConfig.map(buildRoutes);

    if (project?.toolUrls.knowledgeGalaxyEnabled === false) {
      projectToolsRoutes = projectToolsRoutes.filter((r: RouteConfiguration) => r.id !== 'knowledgeGalaxy');
    }

    return {
      allRoutes: [...mainRoutes, ...projectToolsRoutes, ...userToolsRoutes],
      mainRoutes,
      projectToolsRoutes,
      userToolsRoutes,
    };
  }, [buildRoutes, runtimeRunning, runtimeLoading, project?.toolUrls.knowledgeGalaxyEnabled]);
}

export default useProjectNavigation;
