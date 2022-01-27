import * as React from 'react';
import {GetRuntimes_runtimes} from "Graphql/queries/types/GetRuntimes";


type Props = {
  selectedRuntime: GetRuntimes_runtimes;
  close: () => void;
};
function RuntimeInfo({ selectedRuntime, close }: Props) {

  return (
    <div data-testid="runtimesListPanel">

    </div>
  );
}

export default RuntimeInfo;
