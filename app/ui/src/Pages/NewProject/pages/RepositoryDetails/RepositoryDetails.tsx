import React from 'react';
import { RepositoryType } from 'Graphql/types/globalTypes';
import { useReactiveVar } from '@apollo/client';
import ExternalRepository from './components/ExternalRepository/ExternalRepository';
import InternalRepository from './components/InternalRepository/InternalRepository';
import { newProject } from '../../../../Graphql/client/cache';

type Props = {
  showErrors: boolean;
};

function RepositoryDetails({ showErrors }: Props) {
  const { repository } = useReactiveVar(newProject);
  const isExternal = repository.values.type === RepositoryType.EXTERNAL;

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
