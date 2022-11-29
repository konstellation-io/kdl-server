import { ErrorMessage, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';

import ProjectContentRoutes from './ProjectContentRoutes';
import ProjectNavigation from './components/ProjectNavigation/ProjectNavigation';
import Tool from './pages/Tools/components/Tool/Tool';
import ProjectPanels from './ProjectPanels';
import { RouteProjectParams } from 'Constants/routes';
import styles from './Project.module.scss';
import { useParams } from 'react-router-dom';

import { currentTool, openedProject, openedTools } from 'Graphql/client/cache';

import useTools from 'Graphql/client/hooks/useTools';
import useOpenedProject from 'Graphql/client/hooks/useOpenedProject';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import GetProjectsQuery from 'Graphql/queries/getProjects';
import useRuntime from 'Graphql/client/hooks/useRuntime';
import useCapabilities from 'Graphql/client/hooks/useCapabilities';
import { GetRunningRuntime } from 'Graphql/queries/types/GetRunningRuntime';
import GetRunningRuntimeQuery from 'Graphql/queries/getRunningRuntime';
import useRuntimeLoading from 'Graphql/client/hooks/useRuntimeLoading';
import { GetRunningCapabilities } from 'Graphql/queries/types/GetRunningCapabilities';
import GetRunningCapabilitiesQuery from 'Graphql/queries/getRunningCapabilities';
import { GetCapabilities } from 'Graphql/queries/types/GetCapabilities';
import GetCapabilitiesQuery from 'Graphql/queries/getCapabilities';

function Project() {
  const { projectId } = useParams<RouteProjectParams>();
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);

  const project = useReactiveVar(openedProject);
  const currentToolData = useReactiveVar(currentTool);
  const openedToolsData = useReactiveVar(openedTools);

  const { updateOpenedProject } = useOpenedProject();
  const { resetTools } = useTools();
  const { updateRunningRuntime } = useRuntime();
  const { setRunningCapabilities } = useCapabilities();

  const { data: dataRuntimeRunning, loading: runtimeLoading } = useQuery<GetRunningRuntime>(GetRunningRuntimeQuery);
  const { data: dataCapabilitiesRunning } = useQuery<GetRunningCapabilities>(GetRunningCapabilitiesQuery);
  const { data: dataCapabilities } = useQuery<GetCapabilities>(GetCapabilitiesQuery);
  const { setRuntimeLoading } = useRuntimeLoading();

  useEffect(() => {
    const currentProject = data?.projects.find((p) => p.id === projectId);
    if (currentProject) {
      updateOpenedProject(currentProject);
    }
    // updateOpenedProject does not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, projectId]);

  useEffect(() => {
    setRuntimeLoading(runtimeLoading ? 'unknown' : null);
    if (dataRuntimeRunning?.runningRuntime) {
      updateRunningRuntime(dataRuntimeRunning.runningRuntime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRuntimeRunning, runtimeLoading]);

  useEffect(() => {
    if (dataCapabilitiesRunning?.runningCapability) {
      setRunningCapabilities(dataCapabilitiesRunning.runningCapability);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataCapabilitiesRunning]);

  useEffect(() => {
    if (!dataCapabilitiesRunning?.runningCapability && dataCapabilities?.capabilities) {
      setRunningCapabilities(
        dataCapabilities.capabilities
          .slice()
          .sort((a, b) => (a.default ? 1 : -1))
          .reverse()[0],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataCapabilities]);

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
    </div>
  );
}

export default Project;
