import { ErrorMessage, ModalContainer, ModalLayoutInfo, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';

import ProjectContentRoutes from './ProjectContentRoutes';
import ProjectNavigation from './components/ProjectNavigation/ProjectNavigation';
import Tool from './pages/Tools/components/Tool/Tool';
import ProjectPanels from './ProjectPanels';
import { RouteProjectParams } from 'Constants/routes';
import styles from './Project.module.scss';
import { useParams } from 'react-router-dom';

import {
  currentTool,
  lastRanRuntime,
  openedProject,
  openedTools,
  runningRuntime,
  selectedRuntime,
} from 'Graphql/client/cache';

import useTools from 'Graphql/client/hooks/useTools';
import useOpenedProject from 'Graphql/client/hooks/useOpenedProject';
import useRuningRuntime from 'Graphql/client/hooks/useRunningRuntime';
import useSelectedRuntime from 'Graphql/client/hooks/useSelectedRuntime';
import useLastRanRuntime from 'Graphql/client/hooks/useLastRanRuntime';
import useTool from 'Graphql/hooks/useTool';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useBoolState from 'Hooks/useBoolState';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import GetProjectsQuery from 'Graphql/queries/getProjects';
import { GetRunningRuntime } from 'Graphql/queries/types/GetRunningRuntime';
import GetRunningRuntimeQuery from 'Graphql/queries/GetRunningRuntime';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';

import { USERTOOLS_PANEL_OPTIONS } from './panelSettings';
import Runtime from './panels/RuntimesList/components/Runtime';

function Project() {
  const { projectId } = useParams<RouteProjectParams>();
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { data: dataRuntimeRunning } = useQuery<GetRunningRuntime>(GetRunningRuntimeQuery);

  const project = useReactiveVar(openedProject);
  const runtimeSelected = useReactiveVar(selectedRuntime);
  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeLastRan = useReactiveVar(lastRanRuntime);
  const currentToolData = useReactiveVar(currentTool);
  const openedToolsData = useReactiveVar(openedTools);

  const { updateOpenedProject } = useOpenedProject();
  const { updateRunningRuntime } = useRuningRuntime();
  const { updateSelectedRuntime } = useSelectedRuntime();
  const { updateLastRanRuntime } = useLastRanRuntime();
  const { resetTools } = useTools();
  const { updateProjectActiveTools } = useTool();
  const { openPanel: openRuntimesList } = usePanel(PanelType.PRIMARY, USERTOOLS_PANEL_OPTIONS);
  const {
    activate: showPauseRuntimeModal,
    deactivate: closePauseRuntimeModal,
    value: isPauseRuntimeModalVisible,
  } = useBoolState();
  const {
    activate: showReplaceRuntimeModal,
    deactivate: closeReplaceRuntimeModal,
    value: isReplaceRuntimeModalVisible,
  } = useBoolState();

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

  useEffect(() => {
    if (dataRuntimeRunning?.runningRuntime) {
      updateRunningRuntime(dataRuntimeRunning.runningRuntime);
      updateSelectedRuntime(dataRuntimeRunning.runningRuntime);
      updateLastRanRuntime(dataRuntimeRunning.runningRuntime);
    }

    // updateRunningRuntime circular ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRuntimeRunning]);

  function startTools(runtime: GetRuntimes_runtimes | null) {
    closeReplaceRuntimeModal();

    if (!runtime) {
      // if starting the tools and runtime is NOT selected
      return openRuntimesList();
    }

    updateRunningRuntime(runtime);
    updateLastRanRuntime(runtime);
    updateProjectActiveTools(true);
  }

  function startToolsWithCurrentRuntime() {
    startTools(runtimeLastRan);
  }

  function startToolsWithSelectedRuntime() {
    if (runtimeRunning) {
      return showReplaceRuntimeModal();
    }

    startTools(runtimeSelected);
  }

  function stopTools() {
    closePauseRuntimeModal();
    updateRunningRuntime(null);
    updateProjectActiveTools(false);
  }

  if (loading || !project) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <ProjectNavigation pauseRuntime={showPauseRuntimeModal} startRuntime={startToolsWithCurrentRuntime} />
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
        <ProjectPanels
          openedProject={project}
          pauseRuntime={showPauseRuntimeModal}
          startRuntime={startToolsWithSelectedRuntime}
        />
      </div>
      {isPauseRuntimeModalVisible && (
        <ModalContainer
          title="STOP YOUR TOOLS"
          onAccept={stopTools}
          onCancel={closePauseRuntimeModal}
          actionButtonLabel="Stop Tools"
          actionButtonCancel="Cancel"
          className={styles.stopModal}
          warning
          blocking
        >
          <ModalLayoutInfo className={styles.stopModalInfo}>
            You are going to stop your user tools, please confirm your choice.
          </ModalLayoutInfo>
          {runtimeRunning && (
            <ModalLayoutInfo className={styles.stopModalInfo}>
              <Runtime runtime={runtimeRunning} runtimeActive={true} />
            </ModalLayoutInfo>
          )}
        </ModalContainer>
      )}
      {isReplaceRuntimeModalVisible && (
        <ModalContainer
          title="REPLACE YOUR TOOLS"
          onAccept={() => startTools(runtimeSelected)}
          onCancel={closeReplaceRuntimeModal}
          actionButtonLabel="Replace Tools"
          actionButtonCancel="Cancel"
          warning
          blocking
        >
          <ModalLayoutInfo>
            You are going to replace your user tools with a new runtime, please confirm your choice.
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default Project;
