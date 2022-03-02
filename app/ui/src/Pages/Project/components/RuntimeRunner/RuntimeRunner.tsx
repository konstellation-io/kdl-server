import { ModalContainer, ModalLayoutInfo } from 'kwc';
import React, { useEffect } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import styles from './RuntimeRunner.module.scss';
import { actionRuntime, runningRuntime } from 'Graphql/client/cache';
import useTool from 'Graphql/hooks/useTool';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useBoolState from 'Hooks/useBoolState';
import { GetRunningRuntime } from 'Graphql/queries/types/GetRunningRuntime';
import GetRunningRuntimeQuery from 'Graphql/queries/getRunningRuntime';
import { USERTOOLS_PANEL_OPTIONS } from '../../panelSettings';
import Runtime from '../../panels/RuntimesList/components/Runtime';
import useRuntime from 'Graphql/client/hooks/useRuntime';
import { RuntimeActions } from 'Graphql/client/models/RuntimeAction';
import useRuntimeLoading from 'Graphql/client/hooks/useRuntimeLoading';

function RuntimeRunner() {
  const { data: dataRuntimeRunning, loading } = useQuery<GetRunningRuntime>(GetRunningRuntimeQuery);
  const { setRuntimeLoading } = useRuntimeLoading();
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
    const loadingRuntime = loading ? 'unknown' : '';
    setRuntimeLoading(loadingRuntime);
    if (dataRuntimeRunning?.runningRuntime) {
      updateRunningRuntime(dataRuntimeRunning.runningRuntime);
      updateLastRanRuntime(dataRuntimeRunning.runningRuntime);
    }

    // updateRunningRuntime circular ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRuntimeRunning]);

  useEffect(() => {
    if (!runtimeAction) return;
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
    if (runtimeAction?.runtime?.id === runtimeRunning?.id) return;
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

  async function startTools() {
    if (!runtimeAction?.runtime) return;

    closeReplaceRuntimeModal();
    await updateProjectActiveTools(true, runtimeAction.runtime.id);
    updateRunningRuntime(runtimeAction.runtime);
    updateLastRanRuntime(runtimeAction.runtime);
  }

  async function stopTools() {
    closePauseRuntimeModal();
    await updateProjectActiveTools(false, runtimeRunning?.id ?? null);
    updateRunningRuntime(null);
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
          className={cx(styles.runtimeModal, styles.close)}
          warning
          blocking
        >
          <ModalLayoutInfo className={styles.runtimeModalInfo}>
            <div data-testid="stopToolsModal">
              <p>You are going to stop your user tools, please confirm your choice.</p>
              {runtimeRunning && <Runtime runtime={runtimeRunning} runtimeActive={true} disabled={true} />}
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
              {runtimeRunning && <Runtime runtime={runtimeRunning} runtimeActive={true} disabled={true} />}
            </div>
          </ModalLayoutInfo>
          <ModalLayoutInfo className={styles.runtimeModalInfo}>
            <div>
              <p>And this Runtime will activate instead</p>
              {runtimeAction?.runtime && <Runtime runtime={runtimeAction?.runtime} disabled={true} />}
            </div>
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default RuntimeRunner;
