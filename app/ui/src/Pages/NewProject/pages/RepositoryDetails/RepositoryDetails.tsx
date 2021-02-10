import { SpinnerCircular } from 'kwc';
import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';

import React from 'react';
import { RepositoryType } from 'Graphql/types/globalTypes';
import { useQuery } from '@apollo/client';
import ExternalRepository from './components/ExternalRepository/ExternalRepository';
import InternalRepository from './components/InternalRepository/InternalRepository';

type Props = {
  showErrors: boolean;
};

function RepositoryDetails({ showErrors }: Props) {
  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);

  if (!data) return <SpinnerCircular />;

  const {
    values: { type },
  } = data.newProject.repository;

  const isExternal = type === RepositoryType.EXTERNAL;

  return (
    <div>
      {isExternal ? (
        <ExternalRepository showErrors={showErrors} />
      ) : (
        <InternalRepository showErrors={showErrors} />
      )}
    </div>
  );
}

export default RepositoryDetails;
