import * as React from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import Crumb, { BottomComponentProps } from '../Crumb/Crumb';
import GetCapabilitiesQuery from 'Graphql/queries/getCapabilities';
import { loadingRuntime, runningRuntime, selectedCapabilities } from 'Graphql/client/cache';
import { GetCapabilities } from 'Graphql/queries/types/GetCapabilities';
import RuntimeIcon, { RUNTIME_STATUS } from 'Components/Icons/RuntimeIcon/RuntimeIcon';
import CapabilitiesSelector from 'Components/SiteBar/components/CapabilitiesSelector/CapabilitiesSelector';
import { useRouteMatch } from 'react-router-dom';
import ROUTE from 'Constants/routes';

export type Props = {
  title?: string;
};

function CapabilitiesCrumb({ title }: Props) {
  const { data, error } = useQuery<GetCapabilities>(GetCapabilitiesQuery);
  const isProjectRoute = useRouteMatch(ROUTE.PROJECT);
  const selectedCapability = useReactiveVar(selectedCapabilities);
  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeLoading = useReactiveVar(loadingRuntime);

  if (!data || !isProjectRoute) return null;
  if (error) throw Error('cannot retrieve data at CapabilitiesCrumb');

  const executionStatus = runtimeRunning ? RUNTIME_STATUS.RUNNING : RUNTIME_STATUS.STOPPED;

  const runtimeStatus = runtimeLoading !== null ? RUNTIME_STATUS.LOADING : executionStatus;

  return (
    <Crumb
      crumbText={selectedCapability ? selectedCapability.name : ''}
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
