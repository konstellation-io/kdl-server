import { BottomComponentProps, CrumbProps } from './components/Crumb/Crumb';
import { useLocation, useRouteMatch } from 'react-router-dom';
import useProjectNavigation, {
  EnhancedRouteConfiguration,
  projectRoutesConfiguration,
} from 'Hooks/useProjectNavigation';

import { CONFIG } from 'index';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import ProjectIcon from 'Components/Icons/ProjectIcon/ProjectIcon';
import ProjectSelector from '../ProjectSelector/ProjectSelector';
import ROUTE from 'Constants/routes';
import React from 'react';
import SectionSelector from '../SectionSelector/SectionSelector';
import ServerIcon from 'Components/Icons/ServerIcon/ServerIcon';
import ServerMetrics from '../ServerMetrics/ServerMetrics';
import { loader } from 'graphql.macro';
import { useQuery, useReactiveVar } from '@apollo/client';
import { openedProject } from 'Graphql/client/cache';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

function useBreadcrumbs() {
  const crumbs: CrumbProps[] = [];
  const routeMatch = useRouteMatch(ROUTE.PROJECT);
  const location = useLocation();

  const { data: projectsData, loading, error } = useQuery<GetProjects>(
    GetProjectsQuery
  );

  const project = useReactiveVar(openedProject);

  const projectSections: EnhancedRouteConfiguration[] = useProjectNavigation(
    project?.id || ''
  );

  if (loading || !projectsData) return { loading, crumbs };
  if (error) throw Error('cannot retrieve data at useBreadcrumbs');

  // Add server crumb
  crumbs.push({
    crumbText: CONFIG.SERVER_NAME,
    LeftIconComponent: <ServerIcon className="icon-regular" />,
    RightIconComponent: ExpandMoreIcon,
    BottomComponent: (props: BottomComponentProps) => (
      <ServerMetrics serverUrl={CONFIG.SERVER_URL} {...props} />
    ),
  });

  // Check if we are in a project
  if (routeMatch && project) {
    // Add crumb for the project
    const { name, state } = project;
    crumbs.push({
      crumbText: name,
      LeftIconComponent: <ProjectIcon className="icon-regular" state={state} />,
      RightIconComponent: ExpandMoreIcon,
      BottomComponent: (props: BottomComponentProps) => (
        <ProjectSelector options={projectsData.projects} {...props} />
      ),
    });

    // Add crumb for the section
    const lastParam: string = location.pathname.split('/').pop() || '';
    const projectRoute = Object.values(projectRoutesConfiguration).find(
      ({ id }) => id === lastParam
    );

    if (projectRoute) {
      const { label: crumbText, Icon } = projectRoute;
      crumbs.push({
        crumbText,
        LeftIconComponent: <Icon className="icon-small" />,
        RightIconComponent: ExpandMoreIcon,
        BottomComponent: (props: BottomComponentProps) => (
          <SectionSelector options={projectSections} {...props} />
        ),
      });
    }
  }

  return {
    crumbs,
  };
}

export default useBreadcrumbs;
