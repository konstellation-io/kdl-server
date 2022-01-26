import * as React from 'react';
import {GetRuntime_runtimes} from "Graphql/queries/types/GetRuntime";


type Props = {
  selectedRuntime: GetRuntime_runtimes;
  close: () => void;
};
function RuntimeInfo({ selectedRuntime, close }: Props) {

  return (
    <div data-testid="runtimesListPanel">

    </div>
  );
}

export default RuntimeInfo;
