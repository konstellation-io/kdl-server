import * as React from 'react';
import {useQuery} from "@apollo/client";
import GetRuntimesQuery from "Graphql/queries/getRuntimes";
import {GetRuntimes} from "Graphql/queries/types/GetRuntimes";
import {ErrorMessage, SpinnerCircular} from "kwc";
import Runtime from "./components/Runtime";

function RuntimesList() {

  const { data, error, loading } = useQuery<GetRuntimes>(GetRuntimesQuery);

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  return (
    <div data-testid="runtimesListPanel" >
      {[
        ...data.runtimes.map((runtime) => (
          <Runtime key={runtime.id} runtime={runtime} />
        )),
      ]}
    </div>
  );
}

export default RuntimesList;
