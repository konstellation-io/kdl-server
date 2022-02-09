import { ModalContainer, ModalLayoutInfo } from 'kwc';
import React, { useEffect } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import styles from './RuntimeRunner.module.scss';

import { actionRuntime, runningRuntime } from 'Graphql/client/cache';
import useTool from 'Graphql/hooks/useTool';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useBoolState from 'Hooks/useBoolState';
import { GetRunningRuntime } from 'Graphql/queries/types/GetRunningRuntime';
import GetRunningRuntimeQuery from 'Graphql/queries/GetRunningRuntime';
import { USERTOOLS_PANEL_OPTIONS } from '../../panelSettings';
import Runtime from '../../panels/RuntimesList/components/Runtime';
import useRuntime from 'Graphql/client/hooks/useRuntime';
import { RuntimeActions } from 'Graphql/client/models/RuntimeAction';

function RuntimeRunner() {
  const { data: dataRuntimeRunning } = useQuery<GetRunningRuntime>(GetRunningRuntimeQuery);

  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeAction = useReactiveVar(actionRuntime);

  const { updateRunningRuntime, updateLastRanRuntime } = useRuntime();
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
    if (dataRuntimeRunning?.runningRuntime) {
      updateRunningRuntime(dataRuntimeRunning.runningRuntime);
      updateLastRanRuntime(dataRuntimeRunning.runningRuntime);
    }

    // updateRunningRuntime circular ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRuntimeRunning]);

  useEffect(() => {
    if (runtimeAction?.action === RuntimeActions.STOP) {
      // pause
      showPauseRuntimeModal();
      return;
    }

    // play
    handleStartTools();

    // updateOpenedProject does not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtimeAction]);

  //decide whether start the tools or show the replace modal
  function handleStartTools() {
    if (!runtimeAction?.runtime) {
      // if starting the tools and runtime is NOT selected
      return openRuntimesList();
    }

    if (runtimeRunning) {
      return showReplaceRuntimeModal();
    }

    // just play it
    startTools();
  }

  function startTools() {
    if (!runtimeAction?.runtime) return;

    closeReplaceRuntimeModal();
    updateRunningRuntime(runtimeAction.runtime);
    updateLastRanRuntime(runtimeAction.runtime);
    updateProjectActiveTools(true);
    // TODO: make the real call to start the tools
  }

  function stopTools() {
    closePauseRuntimeModal();
    updateRunningRuntime(null);
    updateProjectActiveTools(false);
  }

  return (
    <div className={styles.container}>
      {isPauseRuntimeModalVisible && (
        <ModalContainer
          title="STOP YOUR TOOLS"
          onAccept={stopTools}
          onCancel={closePauseRuntimeModal}
          actionButtonLabel="Stop Tools"
          actionButtonCancel="Cancel"
          className={styles.runtimeModal}
          warning
          blocking
        >
          <ModalLayoutInfo className={styles.runtimeModalInfo}>
            <div>
              <p>You are going to stop your user tools, please confirm your choice.</p>
              {runtimeRunning && <Runtime runtime={runtimeRunning} runtimeActive={true} />}
            </div>
          </ModalLayoutInfo>
        </ModalContainer>
      )}
      {isReplaceRuntimeModalVisible && (
        <ModalContainer
          title="REPLACE YOUR TOOLS"
          onAccept={startTools}
          onCancel={closeReplaceRuntimeModal}
          actionButtonLabel="Replace Tools"
          actionButtonCancel="Cancel"
          className={styles.runtimeModal}
          warning
          blocking
        >
          <ModalLayoutInfo className={styles.runtimeModalInfo}>
            <div>
              <p>You are about to stop this active Runtime. ¿Are you sure?</p>
              {runtimeRunning && <Runtime runtime={runtimeRunning} runtimeActive={true} />}
            </div>
          </ModalLayoutInfo>
          <ModalLayoutInfo className={styles.runtimeModalInfo}>
            <div>
              <p>And this Runtime will activate instead</p>
              {runtimeAction?.runtime && <Runtime runtime={runtimeAction?.runtime} />}
            </div>
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default RuntimeRunner;
