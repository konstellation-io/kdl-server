import * as React from 'react';
import { useQuery } from '@apollo/client';
import GetRuntimesQuery from 'Graphql/queries/getRuntimes';
import GetRunningRuntimeQuery from 'Graphql/queries/GetRunningRuntime';
import { GetRuntimes, GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import { ErrorMessage, SpinnerCircular } from 'kwc';
import styles from './RuntimeList.module.scss';
import Runtime from './components/Runtime';
import {
  GetRunningRuntime,
  GetRunningRuntime_runningRuntime,
} from '../../../../Graphql/queries/types/GetRunningRuntime';

function RuntimesList() {
  const { data, error, loading } = useQuery<GetRuntimes>(GetRuntimesQuery);
  const { data: dataRunning, loading: loadingRunning } = useQuery<GetRunningRuntime>(GetRunningRuntimeQuery);

  if (loading || loadingRunning) return <SpinnerCircular />;
  if (error || !data || !dataRunning) return <ErrorMessage />;

  function sortRuntimes(runtimes: GetRuntimes_runtimes[], runningRuntimeId?: string) {
    if (!runningRuntimeId) {
      return runtimes;
    }
    return [...runtimes].sort((x, y) => {
      return x.id === runningRuntimeId ? -1 : y.id === runningRuntimeId ? 1 : 0;
    });
  }

  const runtimes = sortRuntimes(data.runtimes, dataRunning.runningRuntime?.id);

  return (
    <div data-testid="runtimesListPanel" className={styles.runtimesListPanel}>
      <div className={styles.runtimeListCaption}>
        Runtimes allows you to personalize the capabilities and libraries version of your user tools.
      </div>
      <div className={styles.runtimeContainer}>
        <div className={styles.runtimeListHeader}>{runtimes.length} RUNTIMES SHOWN</div>
        <div className={styles.wrapper}>
          {[
            ...runtimes.map((runtime) => (
              <Runtime
                key={runtime.id}
                runtime={runtime}
                runtimeActive={runtime.id === dataRunning?.runningRuntime?.id}
              />
            )),
          ]}
        </div>
      </div>
    </div>
  );
}

export default RuntimesList;
