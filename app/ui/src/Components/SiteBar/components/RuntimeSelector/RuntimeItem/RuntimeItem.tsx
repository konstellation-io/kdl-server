import React from 'react';
import styles from './RuntimeItem.module.scss';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import RuntimeIcon, { RUNTIME_STATUS } from 'Components/Icons/RuntimeIcon/RuntimeIcon';
import { useReactiveVar } from '@apollo/client';
import { lastRanRuntime, loadingRuntime, runningRuntime } from 'Graphql/client/cache';
import useRuntime from 'Graphql/client/hooks/useRuntime';

type Props = {
  runtime: GetRuntimes_runtimes;
};

function RuntimeItem({ runtime }: Props) {
  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeLoading = useReactiveVar(loadingRuntime);
  const lastRuntime = useReactiveVar(lastRanRuntime);
  const { startRuntime } = useRuntime();
  const isRuntimeRunning = runtimeRunning?.id === runtime.id;

  const getRuntimeStatus = () => {
    const isRuntimeLoading = runtimeLoading === runtime?.id;
    const isRuntimeRunningReplaced = isRuntimeRunning && runtimeLoading !== '';
    const isLastRuntimeExecuted = lastRuntime?.id === runtime.id;

    if (isRuntimeLoading || isRuntimeRunningReplaced) return RUNTIME_STATUS.LOADING;
    if (isRuntimeRunning) return RUNTIME_STATUS.RUNNING;
    if (!runtimeRunning && isLastRuntimeExecuted) return RUNTIME_STATUS.STOPPED;
    return RUNTIME_STATUS.NOT_SELECTED;
  };

  return (
    <button
      className={styles.container}
      disabled={runtimeLoading !== '' || isRuntimeRunning}
      onClick={() => startRuntime(runtime)}
    >
      <div className={styles.nameContainer}>
        <RuntimeIcon status={getRuntimeStatus()} className="icon-regular" />
        <div className={styles.name}>{runtime.name}</div>
      </div>
      <div className={styles.labels}>
        {runtime.labels?.map((label: string) => (
          <div key={label} className={styles.label}>
            {label}
          </div>
        ))}
      </div>
    </button>
  );
}

export default RuntimeItem;
