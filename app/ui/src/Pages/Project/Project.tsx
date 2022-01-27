import { ErrorMessage, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';
import { currentTool, openedProject, openedTools } from 'Graphql/client/cache';
import { useQuery, useReactiveVar } from '@apollo/client';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import ProjectContentRoutes from './ProjectContentRoutes';
import ProjectNavigation from './components/ProjectNavigation/ProjectNavigation';
import ProjectPanels from './ProjectPanels';
import { RouteProjectParams } from 'Constants/routes';
import Tool from './pages/Tools/components/Tool/Tool';
import styles from './Project.module.scss';
import useOpenedProject from 'Graphql/client/hooks/useOpenedProject';
import { useParams } from 'react-router-dom';
import useTools from 'Graphql/client/hooks/useTools';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import UserToolsPanels from './UserToolsPanels';

function Project() {
  const { projectId } = useParams<RouteProjectParams>();
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);

  const project = useReactiveVar(openedProject);
  const { updateOpenedProject } = useOpenedProject();

  const currentToolData = useReactiveVar(currentTool);
  const openedToolsData = useReactiveVar(openedTools);
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
    [],
  );

  if (loading || !project) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <ProjectNavigation />
      <div className={styles.contentLayer}>
        <ProjectContentRoutes openedProject={project} />
        {openedToolsData.map((toolName) => (
          <Tool
            key={toolName}
            name={toolName}
            src={project.toolUrls[toolName]}
            isHidden={currentToolData !== toolName}
          />
        ))}
      </div>
      <div className={styles.panelLayer}>
        <ProjectPanels openedProject={project} />
      </div>
      <div className={styles.panelLayer}>
        <UserToolsPanels />
      </div>
    </div>
  );
}

export default Project;
