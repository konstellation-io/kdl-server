import React from 'react';
import cx from 'classnames';
import { ModalContainer, ModalLayoutInfo } from 'kwc';
import { useReactiveVar } from '@apollo/client';
import Runtime from 'Pages/Project/panels/RuntimesList/components/Runtime';
import useBoolState from 'Hooks/useBoolState';
import useRuntime from 'Graphql/client/hooks/useRuntime';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import { runningRuntime } from 'Graphql/client/cache';
import styles from './RuntimeRunner.module.scss';

export enum RuntimeAction {
  Start,
  Stop,
}

type Props = {
  action: RuntimeAction;
  runtime?: GetRuntimes_runtimes;
  children: JSX.Element;
};

const RuntimeRunner = ({ action, runtime, children }: Props) => {
  const { startRuntime, pauseRuntime } = useRuntime(runtime);
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
  const runtimeRunning = useReactiveVar(runningRuntime);

  const handlePauseRuntime = () => {
    pauseRuntime();
  };

  const handleReplaceRuntime = () => {
    startRuntime(runtime);
    closeReplaceRuntimeModal();
  };

  const handleClick = () => {
    if (action === RuntimeAction.Start) {
      if (!runtimeRunning) {
        startRuntime(runtime);
        return;
      }
      showReplaceRuntimeModal();
    }
    if (action === RuntimeAction.Stop) {
      showPauseRuntimeModal();
    }
  };
  return (
    <div>
      {React.cloneElement(children, { onClick: handleClick })}
      <div>
        {isPauseRuntimeModalVisible && (
          <ModalContainer
            title="STOP YOUR TOOLS"
            onAccept={handlePauseRuntime}
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
                {runtimeRunning && <Runtime runtime={runtimeRunning} isRunning={true} disabled={true} />}
              </div>
            </ModalLayoutInfo>
          </ModalContainer>
        )}
        {isReplaceRuntimeModalVisible && (
          <ModalContainer
            title="REPLACE YOUR TOOLS"
            onAccept={handleReplaceRuntime}
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
                {runtimeRunning && <Runtime runtime={runtimeRunning} isRunning={true} disabled={true} />}
              </div>
            </ModalLayoutInfo>
            <ModalLayoutInfo className={styles.runtimeModalInfo}>
              <div>
                <p>And this Runtime will activate instead</p>
                {runtime && <Runtime runtime={runtime} disabled={true} />}
              </div>
            </ModalLayoutInfo>
          </ModalContainer>
        )}
      </div>
    </div>
  );
};

export default RuntimeRunner;
