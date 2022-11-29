import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';
import { GetRunningRuntime_runningRuntime } from '../../Graphql/queries/types/GetRunningRuntime';

export const capability: GetCapabilities_capabilities = {
  __typename: 'Capability',
  id: 'capability1',
  name: 'Capability Name 1',
  default: false,
};

export const capability2: GetCapabilities_capabilities = {
  __typename: 'Capability',
  id: 'capability2',
  name: 'Capability Name 2',
  default: true,
};
