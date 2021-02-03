import {
  BottomComponentProps,
  CrumbProps,
} from 'Pages/Home/pages/Server/components/ServerBar/components/Breadcrumbs/components/Crumb/Crumb';
import {
  GET_OPENED_PROJECT,
  GetOpenedProject,
} from 'Graphql/client/queries/getOpenedProject.graphql';
import { useLocation, useRouteMatch } from 'react-router-dom';
import useProjectNavigation, {
  EnhancedRouteConfiguration,
  projectRoutesConfiguration,
} from 'Hooks/useProjectNavigation';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import ProjectIcon from 'Components/Icons/ProjectIcon/ProjectIcon';
import ProjectSelector from '../ProjectSelector/ProjectSelector';
import ROUTE from 'Constants/routes';
import React from 'react';
import SectionSelector from '../SectionSelector/SectionSelector';
import ServerIcon, {
  RemoteServerStates,
} from 'Components/Icons/ServerIcon/ServerIcon';
import ServerMetrics from 'Pages/Home/pages/Server/components/ServerBar/components/ServerMetrics/ServerMetrics';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import { CONFIG } from 'index';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

function useBreadcrumbs() {
  const crumbs: CrumbProps[] = [];
  const routeMatch = useRouteMatch(ROUTE.PROJECT);
  const location = useLocation();

  const {
    data: projectsData,
    loading: projectsLoading,
    error: projectsError,
  } = useQuery<GetProjects>(GetProjectsQuery);
  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useQuery<GetOpenedProject>(GET_OPENED_PROJECT);

  const projectSections: EnhancedRouteConfiguration[] = useProjectNavigation(
    '',
    projectData?.openedProject?.id || ''
  );

  const loading = projectLoading || projectsLoading;
  const error = projectError || projectsError;

  if (loading || !projectsData) return { loading, crumbs };
  if (error) throw Error('cannot retrieve data at useBreadcrumbs');

  // TODO: server env var
  // const {
  //   name: serverName,
  //   id: serverId,
  //   url: serverUrl,
  //   state: serverState,
  // } = serverData.openedServer;

  const openedProject = projectData?.openedProject;

  // Add server crumb
  crumbs.push({
    crumbText: CONFIG.SERVER_NAME,
    LeftIconComponent: (
      <ServerIcon
        className="icon-regular"
        state={RemoteServerStates.SIGNED_IN}
      />
    ),
    BottomComponent: (props: BottomComponentProps) => (
      <ServerMetrics serverUrl={CONFIG.SERVER_URL} {...props} />
    ),
  });

  // Check if we are in a project
  if (routeMatch && openedProject) {
    // Add crumb for the project
    const { name, state } = openedProject;
    crumbs.push({
      crumbText: name,
      LeftIconComponent: <ProjectIcon className="icon-regular" state={state} />,
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
