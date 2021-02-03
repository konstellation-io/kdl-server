import { ServerBaseProps } from './Server';

import React from 'react';

export enum RemoteServerStates {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
}
export interface RemoteServerProps extends ServerBaseProps {
  state: RemoteServerStates;
  url?: string;
}
