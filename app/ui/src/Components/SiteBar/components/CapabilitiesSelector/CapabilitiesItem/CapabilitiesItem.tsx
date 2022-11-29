import React from 'react';
import styles from './CapabilitiesItem.module.scss';
import RuntimeIcon, { RUNTIME_STATUS } from 'Components/Icons/RuntimeIcon/RuntimeIcon';
import { useReactiveVar } from '@apollo/client';
import { runningRuntime, selectedCapabilities } from 'Graphql/client/cache';
import RuntimeRunner, { RuntimeAction } from 'Components/RuntimeRunner/RuntimeRunner';
import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';

type Props = {
  capability: GetCapabilities_capabilities;
};

function CapabilitiesItem({ capability }: Props) {
  const selectedCapability = useReactiveVar(selectedCapabilities);
  const runtimeRunning = useReactiveVar(runningRuntime)
  const isCapabilitySelected = selectedCapability?.id === capability.id;

  const getRuntimeStatus = () => {
    if (isCapabilitySelected) return RUNTIME_STATUS.RUNNING;
    return RUNTIME_STATUS.NOT_SELECTED;
  };

  return (
    <RuntimeRunner
      runtime={runtimeRunning ? runtimeRunning : undefined}
      capability={capability}
      action={RuntimeAction.ReplaceCapability}>
      <button className={styles.container} disabled={isCapabilitySelected}>
        <div className={styles.nameContainer}>
          <RuntimeIcon status={getRuntimeStatus()} className="icon-regular" />
          <div className={styles.name}>{capability.name}</div>
        </div>
      </button>
    </RuntimeRunner>
  );
}

export default CapabilitiesItem;
