import { BottomComponentProps, CrumbProps } from './components/Crumb/Crumb';
import { useLocation, useRouteMatch } from 'react-router-dom';
import useProjectNavigation, {
  RouteConfiguration,
  RoutesConfiguration,
} from 'Hooks/useProjectNavigation';
import { useQuery, useReactiveVar } from '@apollo/client';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { CONFIG } from 'index';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import NavigationSelector from '../NavigationSelector/NavigationSelector';
import PersonIcon from '@material-ui/icons/Person';
import ProjectIcon from 'Components/Icons/ProjectIcon/ProjectIcon';
import ProjectSelector from '../ProjectSelector/ProjectSelector';
import ROUTE from 'Constants/routes';
import React from 'react';
import ServerIcon from 'Components/Icons/ServerIcon/ServerIcon';
import { openedProject } from 'Graphql/client/cache';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import GetMeQuery from 'Graphql/queries/getMe';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { AccessLevel } from 'Graphql/types/globalTypes';

const SECTION_PROJECTS: RouteConfiguration = {
  id: 'projects',
  label: 'Projects',
  Icon: ArrowForwardIcon,
  route: ROUTE.PROJECTS,
};
const SECTION_USERS: RouteConfiguration = {
  id: 'users',
  label: 'Users',
  Icon: PersonIcon,
  route: ROUTE.USERS,
};

function useBreadcrumbs() {
  const crumbs: CrumbProps[] = [];
  const routeMatch = useRouteMatch(ROUTE.PROJECT);
  const location = useLocation();

  const {
    data: projectsData,
    loading,
    error,
  } = useQuery<GetProjects>(GetProjectsQuery);
  const { data: dataMe } = useQuery<GetMe>(GetMeQuery);

  const project = useReactiveVar(openedProject);

  const { allRoutes }: RoutesConfiguration = useProjectNavigation(
    project?.id || ''
  );

  if (loading || !projectsData || !dataMe) return { loading, crumbs };
  if (error) throw Error('cannot retrieve data at useBreadcrumbs');

  const serverSections = [SECTION_PROJECTS];

  // Admin users can access Users section
  if (dataMe.me.accessLevel === AccessLevel.ADMIN) {
    serverSections.push(SECTION_USERS);
  }

  const activeProjects = projectsData.projects.filter(
    (p) => !p.archived && !p.needAccess
  );

  // Add server crumb
  crumbs.push({
    dataTestId: 'server',
    crumbText: CONFIG.SERVER_NAME,
    LeftIconComponent: <ServerIcon className="icon-regular" />,
    BottomComponent: (props: BottomComponentProps) => (
      <NavigationSelector options={serverSections} {...props} />
    ),
  });

  // Check if we are in a project
  if (routeMatch && project) {
    // Add crumb for the project
    const { name, archived } = project;
    crumbs.push({
      crumbText: name,
      LeftIconComponent: (
        <ProjectIcon className="icon-regular" archived={archived} />
      ),
      BottomComponent: (props: BottomComponentProps) => (
        <ProjectSelector options={activeProjects} {...props} />
      ),
    });

    // Add crumb for the section
    const lastParam: string = location.pathname.split('/').pop() || '';
    const projectRoute = allRoutes.find(({ id }) => id === lastParam);

    if (projectRoute) {
      const { label: crumbText, Icon } = projectRoute;
      crumbs.push({
        crumbText,
        LeftIconComponent: <Icon className="icon-small" />,
        BottomComponent: (props: BottomComponentProps) => (
          <NavigationSelector options={allRoutes} {...props} />
        ),
      });
    }
  }

  return {
    crumbs,
  };
}

export default useBreadcrumbs;
