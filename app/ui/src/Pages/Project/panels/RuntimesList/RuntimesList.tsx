import React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import GetRuntimesQuery from 'Graphql/queries/getRuntimes';
import { GetRuntimes, GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import { ErrorMessage } from 'kwc';
import styles from './RuntimeList.module.scss';
import Runtime from './components/Runtime';
import { runningRuntime } from 'Graphql/client/cache';

function RuntimesList() {
  try {
    const runtimeRunning = useReactiveVar(runningRuntime);
    const runtimes = getRuntimes(runtimeRunning);

    return (
      <div data-testid="runtimesListPanel" className={styles.runtimesListPanel}>
        <div className={styles.runtimeListCaption}>
          Runtimes allows you to personalize the capabilities and libraries version of your user tools.
        </div>
        <div className={styles.runtimeContainer}>
          <div className={styles.runtimeListHeader}>{runtimes.length} RUNTIMES SHOWN</div>
          <div className={styles.wrapper} data-testid="runtimesList">
            {[
              ...runtimes.map((runtime) => (
                <Runtime key={runtime.id} runtime={runtime} isRunning={runtime.id === runtimeRunning?.id} />
              )),
            ]}
          </div>
        </div>
      </div>
    );
  } catch {
    return <ErrorMessage />;
  }
}

function getRuntimes(runtimeRunning: GetRuntimes_runtimes | null) {
  const { data, error } = useQuery<GetRuntimes>(GetRuntimesQuery);

  if (error || !data) throw new Error('Exception loading runtimes');

  function sortRuntimes(runtimes: GetRuntimes_runtimes[], runningRuntimeId?: string) {
    if (!runningRuntimeId) {
      return runtimes;
    }
    return [...runtimes].sort((x, y) => {
      return x.id === runningRuntimeId ? -1 : y.id === runningRuntimeId ? 1 : 0;
    });
  }

  return sortRuntimes(data.runtimes, runtimeRunning?.id);
}

export default RuntimesList;
