import * as React from 'react';
import ExternalRepository from './components/ExternalRepository/ExternalRepository';

type Props = {
  showErrors: boolean;
};

function RepositoryDetails({ showErrors }: Props) {
  return (
    <div>
      <ExternalRepository showErrors={showErrors} />
    </div>
  );
}

export default RepositoryDetails;
