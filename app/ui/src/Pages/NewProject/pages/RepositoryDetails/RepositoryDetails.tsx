import * as React from 'react';
import Repository from './components/ExternalRepository/ExternalRepository';

type Props = {
  showErrors: boolean;
};

function RepositoryDetails({ showErrors }: Props) {
  return (
    <div>
      <Repository showErrors={showErrors} />
    </div>
  );
}

export default RepositoryDetails;
