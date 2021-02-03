import ROUTE, { buildRoute } from '../Constants/routes';

import IconHome from '@material-ui/icons/Dashboard';
import IconKG from '@material-ui/icons/EmojiObjects';
import IconSettings from '@material-ui/icons/Settings';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import { useMemo } from 'react';

export interface RouteConfiguration {
  id: string;
  label: string;
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
}

export const projectRoutesConfiguration: {
  [key: string]: RouteConfiguration;
} = {
  [ROUTE.PROJECT_OVERVIEW]: {
    id: 'overview',
    label: 'Overview',
    Icon: IconHome,
  },
  [ROUTE.PROJECT_TOOLS]: {
    id: 'tools',
    label: 'Tools',
    Icon: IconSettings,
  },
  [ROUTE.PROJECT_KG]: {
    id: 'knowledge-graph',
    label: 'Knowledge Graph',
    Icon: IconKG,
  },
};

export interface EnhancedRouteConfiguration extends RouteConfiguration {
  to: string;
}

function useProjectNavigation(serverId: string, projectId: string) {
  const routesConfigurations: EnhancedRouteConfiguration[] = useMemo(
    () =>
      Object.entries(projectRoutesConfiguration).map(
        ([routeString, { id, label, Icon }]) => ({
          to: buildRoute.project(routeString as ROUTE, serverId, projectId),
          id,
          label,
          Icon,
        })
      ),
    [serverId, projectId]
  );
  return routesConfigurations;
}

export default useProjectNavigation;
