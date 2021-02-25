import { ErrorMessage, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import ProjectContentRoutes from './ProjectContentRoutes';
import ProjectNavigation from './components/ProjectNavigation/ProjectNavigation';
import ProjectPanels from './ProjectPanels';
import { RouteProjectParams } from 'Constants/routes';
import { loader } from 'graphql.macro';
import styles from './Project.module.scss';
import { useParams } from 'react-router-dom';
import { useQuery, useReactiveVar } from '@apollo/client';
import useTools from 'Graphql/client/hooks/useTools';
import Tool from './pages/Tools/components/Tool/Tool';
import { openedProject, tools } from 'Graphql/client/cache';
import useOpenedProject from 'Graphql/client/hooks/useOpenedProject';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

function Project() {
  const { projectId } = useParams<RouteProjectParams>();
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);

  const project = useReactiveVar(openedProject);
  const { updateOpenedProject } = useOpenedProject();

  const { currentTool, openedTools } = useReactiveVar(tools);
  const { resetTools } = useTools();

  useEffect(() => {
    const currentProject = data?.projects.find((p) => p.id === projectId);
    if (currentProject) {
      updateOpenedProject(currentProject);
    }
    // updateOpenedProject does not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, projectId]);

  useEffect(
    () => () => {
      updateOpenedProject(null);
      resetTools();
    },
    // We want to execute this on on component mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (loading || !project) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <ProjectNavigation />
      <div className={styles.contentLayer}>
        <ProjectContentRoutes openedProject={project} />
        {openedTools.map((toolName) => (
          <Tool
            key={toolName}
            name={toolName}
            src={project.toolUrls[toolName]}
            isHidden={currentTool !== toolName}
          />
        ))}
      </div>
      <div className={styles.panelLayer}>
        <ProjectPanels openedProject={project} />
      </div>
    </div>
  );
}

export default Project;
