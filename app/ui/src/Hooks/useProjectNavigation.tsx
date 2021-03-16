import ROUTE, { buildRoute } from 'Constants/routes';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import { useCallback, useMemo } from 'react';
import IconHome from '@material-ui/icons/Dashboard';
import IconKG from '@material-ui/icons/EmojiObjects';
import GiteaIcon from 'Components/Icons/GiteaIcon/GiteaIcon';
import MinioIcon from 'Components/Icons/MinioIcon/MinioIcon';
import DroneIcon from 'Components/Icons/DroneIcon/DroneIcon';
import VSIcon from 'Components/Icons/VSIcon/VSIcon';
import JupyterIcon from 'Components/Icons/JupyterIcon/JupyterIcon';
import MlFlowIcon from 'Components/Icons/MlFlowIcon/MlFlowIcon';
import { useQuery } from '@apollo/client';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { loader } from 'graphql.macro';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

export interface RouteConfiguration {
  id: string;
  label: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
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
  {
    id: 'knowledge-graph',
    label: 'Knowledge Galaxy',
    Icon: IconKG,
    route: ROUTE.PROJECT_KG,
  },
];
export const projectToolsRoutesConfig: RouteConfiguration[] = [
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
    id: 'minio',
    route: ROUTE.PROJECT_TOOL_MINIO,
    label: 'Minio',
    Icon: MinioIcon,
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

export interface EnhancedRouteConfiguration extends RouteConfiguration {
  to: string;
}

export interface RoutesConfiguration {
  allRoutes: EnhancedRouteConfiguration[];
  mainRoutes: EnhancedRouteConfiguration[];
  userToolsRoutes: EnhancedRouteConfiguration[];
  projectToolsRoutes: EnhancedRouteConfiguration[];
}

function useProjectNavigation(projectId: string) {
  const { data } = useQuery<GetMe>(GetMeQuery);

  const buildRoutes = useCallback(
    (route: RouteConfiguration) => ({
      ...route,
      to: buildRoute(route.route, projectId),
    }),
    [projectId]
  );

  const routesConfigurations: RoutesConfiguration = useMemo(() => {
    const disabled = data?.me.areToolsActive || true;
    const userToolsRoutesDisabled = userToolsRoutesConfig.map((route) => ({
      ...route,
      disabled,
    }));

    const userToolsRoutes = userToolsRoutesDisabled.map(buildRoutes);
    const projectToolsRoutes = projectToolsRoutesConfig.map(buildRoutes);
    const mainRoutes = mainRoutesConfig.map(buildRoutes);

    return {
      allRoutes: [...mainRoutes, ...projectToolsRoutes, ...userToolsRoutes],
      mainRoutes,
      projectToolsRoutes,
      userToolsRoutes,
    };
  }, [buildRoutes, data?.me.areToolsActive]);

  return routesConfigurations;
}

export default useProjectNavigation;
