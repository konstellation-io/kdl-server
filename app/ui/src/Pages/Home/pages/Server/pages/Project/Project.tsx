import { ErrorMessage, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import ProjectContentRoutes from './ProjectContentRoutes';
import ProjectNavigation from './components/ProjectNavigation/ProjectNavigation';
import ProjectPanels from './ProjectPanels';
import { RouteProjectParams } from 'Constants/routes';
import { loader } from 'graphql.macro';
import styles from './Project.module.scss';
import useOpenedProject from 'Pages/Home/apollo/hooks/useOpenedProject';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

function Project() {
  const { projectId } = useParams<RouteProjectParams>();
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { updateOpenedProject } = useOpenedProject();

  useEffect(() => {
    // console.log(data);
    // const openedProject = data?.projects.find((p) => p.id === projectId);
    // FIXME: uncomment prev line and remove next line
    const openedProject = data?.projects[0];
    openedProject && updateOpenedProject(openedProject);
  }, [data, projectId, updateOpenedProject]);

  useEffect(
    () => () => updateOpenedProject(null),
    // We want to execute this on on component mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  // FIXME: get real openedProject
  const project = data.projects[0];

  return (
    <div className={styles.container}>
      <ProjectNavigation />
      <div className={styles.contentLayer}>
        <ProjectContentRoutes />
      </div>
      <div className={styles.panelLayer}>
        <ProjectPanels openedProject={project} />
      </div>
    </div>
  );
}

export default Project;
