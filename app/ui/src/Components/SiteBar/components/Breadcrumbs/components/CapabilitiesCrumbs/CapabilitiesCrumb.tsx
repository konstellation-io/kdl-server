import * as React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import Crumb, { BottomComponentProps } from '../Crumb/Crumb';
import GetCapabilitiesQuery from 'Graphql/queries/getCapabilities';
import { lastRanRuntime, loadingRuntime, runningRuntime, selectedCapabilities } from 'Graphql/client/cache';
import { GetCapabilities, GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';
import RuntimeIcon, { RUNTIME_STATUS } from 'Components/Icons/RuntimeIcon/RuntimeIcon';
import CapabilitiesSelector from 'Components/SiteBar/components/CapabilitiesSelector/CapabilitiesSelector';
import getCapabilities from 'Graphql/queries/getCapabilities';

export type Props = {
  title?: string;
};

function CapabilitiesCrumb({title }: Props) {
  const { data, loading, error } = useQuery<GetCapabilities>(GetCapabilitiesQuery);
  const runtimeLastRan = useReactiveVar(lastRanRuntime);
  const selectedCapability = useReactiveVar(selectedCapabilities);
  const runtimeRunning = useReactiveVar(runningRuntime)
  const runtimeLoading = useReactiveVar(loadingRuntime);

  if (!data) return null;
  if (error) throw Error('cannot retrieve data at CapabilitiesCrumb');

  const executionStatus = runtimeRunning ? RUNTIME_STATUS.RUNNING : RUNTIME_STATUS.STOPPED;

  const runtimeStatus = runtimeLoading !== null ? RUNTIME_STATUS.LOADING : executionStatus;

  return (
    <Crumb
      crumbText={selectedCapability? selectedCapability.name : ""}
      isSelect={true}
      LeftIconComponent={<RuntimeIcon className="icon-regular" status={runtimeStatus} />}
      dataTestId="capabilitiesCrumb"
      title={title}
      show={data.capabilities.length > 1}
    >
      {(props: BottomComponentProps) => <CapabilitiesSelector capabilities={data.capabilities} {...props} />}
    </Crumb>
  );
}

export default CapabilitiesCrumb;
