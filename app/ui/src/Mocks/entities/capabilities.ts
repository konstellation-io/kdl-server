import { GetCapabilities_capabilities } from 'Graphql/queries/types/GetCapabilities';

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
