import * as React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import Crumb, { BottomComponentProps } from '../Crumb/Crumb';
import GetRuntimesQuery from 'Graphql/queries/getRuntimes';
import { lastRanRuntime, loadingRuntime, runningRuntime } from 'Graphql/client/cache';
import { GetRuntimes } from 'Graphql/queries/types/GetRuntimes';
import RuntimeSelector from 'Components/SiteBar/components/RuntimeSelector/RuntimeSelector';
import RuntimeIcon, { RUNTIME_STATUS } from 'Components/Icons/RuntimeIcon/RuntimeIcon';

function RuntimesCrumb() {
  const { data, loading, error } = useQuery<GetRuntimes>(GetRuntimesQuery);
  const runtimeLastRan = useReactiveVar(lastRanRuntime);
  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeLoading = useReactiveVar(loadingRuntime);

  if (loading || !runtimeLastRan || !data) return null;
  if (error) throw Error('cannot retrieve data at RuntimesCrumb');

  const executionStatus = runtimeRunning ? RUNTIME_STATUS.RUNNING : RUNTIME_STATUS.STOPPED;

  const runtimeStatus = runtimeLoading !== '' ? RUNTIME_STATUS.LOADING : executionStatus;

  return (
    <Crumb
      crumbText={runtimeLastRan.name}
      isSelect={true}
      LeftIconComponent={<RuntimeIcon className="icon-regular" status={runtimeStatus} />}
    >
      {(props: BottomComponentProps) => <RuntimeSelector runtimes={data.runtimes} {...props} />}
    </Crumb>
  );
}

export default RuntimesCrumb;
