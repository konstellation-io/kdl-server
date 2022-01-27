import * as React from 'react';
import {useQuery} from "@apollo/client";
import GetRuntimesQuery from "Graphql/queries/getRuntimes";
import GetRunningRuntimeQuery from "Graphql/queries/GetRunningRuntime";
import {GetRuntimes} from "Graphql/queries/types/GetRuntimes";
import {ErrorMessage, SpinnerCircular} from "kwc";
import styles from './RuntimeList.module.scss';
import Runtime from "./components/Runtime";
import {GetRunningRuntime} from "../../../../Graphql/queries/types/GetRunningRuntime";

function RuntimesList() {

  const { data, error, loading } = useQuery<GetRuntimes>(GetRuntimesQuery);
  const { data: dataRunning } = useQuery<GetRunningRuntime>(GetRunningRuntimeQuery);

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  return (
    <div data-testid="runtimesListPanel" className={styles.runtimeContainer} >
      {[
        ...data.runtimes.map((runtime) => (
          <Runtime key={runtime.id} runtime={runtime} runtimeActive={runtime.id === dataRunning?.runningRuntime?.id} />
        )),
      ]}
    </div>
  );
}

export default RuntimesList;
