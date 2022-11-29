import React from 'react';
import cx from 'classnames';
import { ModalContainer, ModalLayoutInfo } from 'kwc';
import { useReactiveVar } from '@apollo/client';
import Runtime from 'Pages/Project/panels/RuntimesList/components/Runtime';
import useBoolState from 'Hooks/useBoolState';
import useRuntime from 'Graphql/client/hooks/useRuntime';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import { runningRuntime, selectedCapabilities } from 'Graphql/client/cache';
import styles from './RuntimeRunner.module.scss';
import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';
import Capability from 'Components/Capability/Capability';

export enum RuntimeAction {
  Start,
  Stop,
  ReplaceCapability
}

type Props = {
  action: RuntimeAction;
  runtime?: GetRuntimes_runtimes;
  capability?: GetCapabilities_capabilities;
  children: JSX.Element;
};

const RuntimeRunner = ({ action, runtime, capability, children }: Props) => {
  const { startRuntime, pauseRuntime } = useRuntime(runtime);
  const selectedCapability = useReactiveVar(selectedCapabilities);
  const { activate: showErrorModal, deactivate: closeErrorModal, value: isErrorModalVisible } = useBoolState();
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
  const {
    activate: showReplaceCapabilitiesModal,
    deactivate: closeReplaceCapabilitiesModal,
    value: isReplaceCapabilitiesModalVisible,
  } = useBoolState();

  const runtimeRunning = useReactiveVar(runningRuntime);

  const handlePauseRuntime = () => {
    pauseRuntime();
  };

  const handleReplaceRuntime = () => {
    if (runtime != null && capability != null) {
      startRuntime(runtime, capability?.id);
    }
    closeReplaceRuntimeModal();
  };

   const handleReplaceCapability = () => {
    if (capability != null) {
      selectedCapabilities(capability);
      if (runtime != null) {
        startRuntime(runtime, capability?.id);
      }
    }
    closeReplaceCapabilitiesModal();
  };

  const handleClick = () => {
    if (action === RuntimeAction.Start) {
      if (!selectedCapability) {
        showErrorModal();
        return;
      }
      if (!runtimeRunning) {
        startRuntime(runtime, selectedCapability?.id);
        return;
      }
      showReplaceRuntimeModal();
      return;
    }
    if (action === RuntimeAction.Stop) {
      showPauseRuntimeModal();
      return;
    }
    if (action === RuntimeAction.ReplaceCapability) {
      showReplaceCapabilitiesModal();
      return;
    }
  };
  return (
    <div>
      {React.cloneElement(children, { onClick: handleClick })}
      <div>
        {isErrorModalVisible && (
          <ModalContainer
            title="CANNOT START TOOLS"
            onAccept={closeErrorModal}
            onCancel={closeErrorModal}
            actionButtonLabel="Accept"
            actionButtonCancel="Cancel"
            className={cx(styles.runtimeModal, styles.close)}
            error
            blocking
          >
            <ModalLayoutInfo className={styles.runtimeModalInfo}>
              <div data-testid="errorToolsModal">
                <p>Please select a capability before starting the User Tools.</p>
              </div>
            </ModalLayoutInfo>
          </ModalContainer>
        )}
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
                {runtimeRunning &&
                  <div>
                    <p className={styles.title}>Runtime</p>
                    <Runtime runtime={runtimeRunning} isRunning={true} disabled={true} />
                  </div>
                }
                {selectedCapability &&
                  <div>
                    <p className={styles.title}>Capabilities</p>
                    <Capability capabilityId={selectedCapability.id} capabilityName={selectedCapability.name} disabled={true} />
                  </div>
                }
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
                {runtimeRunning &&
                  <div>
                    <p className={styles.title}>Runtime</p>
                    <Runtime runtime={runtimeRunning} isRunning={true} disabled={true} />
                  </div>
                }
                {selectedCapability &&
                  <div>
                    <p className={styles.title}>Capabilities</p>
                    <Capability capabilityId={selectedCapability.id} capabilityName={selectedCapability.name} disabled={true} />
                  </div>
                }
              </div>
            </ModalLayoutInfo>
            <ModalLayoutInfo className={styles.runtimeModalInfo}>
              <div>
                <p>And this Runtime will activate instead</p>
                {runtime &&
                  <div>
                    <p className={styles.title}>Runtime</p>
                    <Runtime runtime={runtime} isRunning={false} disabled={true} />
                  </div>
                }
                {capability &&
                  <div>
                    <p className={styles.title}>Capabilities</p>
                    <Capability capabilityId={capability?.id} capabilityName={capability?.name} disabled={true} />
                  </div>
                }
              </div>
            </ModalLayoutInfo>
          </ModalContainer>
        )}
        {isReplaceCapabilitiesModalVisible && (
          <ModalContainer
            title="REPLACE YOUR TOOLS"
            onAccept={handleReplaceCapability}
            onCancel={closeReplaceCapabilitiesModal}
            actionButtonLabel="Replace Capabilities"
            actionButtonCancel="Cancel"
            className={styles.runtimeModal}
            warning
            blocking
          >
            <ModalLayoutInfo className={styles.runtimeModalInfo}>
              <div>
                <p>You are about to stop this active Runtime. ¿Are you sure?</p>
                {runtimeRunning &&
                  <div>
                    <p className={styles.title}>Runtime</p>
                    <Runtime runtime={runtimeRunning} isRunning={true} disabled={true} />
                  </div>
                }
                {selectedCapability &&
                  <div>
                    <p className={styles.title}>Capabilities</p>
                    <Capability capabilityId={selectedCapability.id} capabilityName={selectedCapability.name} disabled={true} />
                  </div>
                }
              </div>
            </ModalLayoutInfo>
            <ModalLayoutInfo className={styles.runtimeModalInfo}>
              <div>
                <p>And this Runtime will activate instead</p>
                {runtime &&
                  <div>
                    <p className={styles.title}>Runtime</p>
                    <Runtime runtime={runtime} isRunning={false} disabled={true} />
                  </div>
                }
                {capability &&
                  <div>
                    <p className={styles.title}>Capabilities</p>
                    <Capability capabilityId={capability?.id} capabilityName={capability?.name} disabled={true} />
                  </div>
                }
              </div>
            </ModalLayoutInfo>
          </ModalContainer>
        )}
      </div>
    </div>
  );
};

export default RuntimeRunner;
