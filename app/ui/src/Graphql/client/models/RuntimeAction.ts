import { GetRuntimes_runtimes } from '../../queries/types/GetRuntimes';

export interface RuntimeAction {
  action: RuntimeActions;
  runtime: GetRuntimes_runtimes;
}

export enum RuntimeActions {
  STOP,
  START,
}
