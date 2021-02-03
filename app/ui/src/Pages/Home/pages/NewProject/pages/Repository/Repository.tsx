import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';

import { LOCATION } from './components/RepositoryTypeComponent/RepositoryTypeComponent';
import React from 'react';
import RepositoryOption from './components/RepositoryOption/RepositoryOption';
import { RepositoryType } from 'Graphql/types/globalTypes';
import RepositoryTypeComponent from './components/RepositoryTypeComponent/RepositoryTypeComponent';
import { SpinnerCircular } from 'kwc';
import cx from 'classnames';
import styles from './Repository.module.scss';
import useNewProject from 'Pages/Home/apollo/hooks/useNewProject';
import { useQuery } from '@apollo/client';

function Repository(params: any) {
  const { showErrors } = params;
  const { updateValue, clearError } = useNewProject('repository');
  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);

  if (!data) return <SpinnerCircular />;
  const {
    values: { type },
    errors,
  } = data.newProject.repository;

  return (
    <div className={styles.container}>
      <div
        className={cx(styles.repositories, {
          [styles.error]: showErrors && errors.type,
        })}
      >
        <RepositoryOption
          title="External Repository"
          subtitle="You will connect to a version-control system located outside the Server. Make sure you can access the repository before trying to connect to and include your SSH key inside it."
          actionLabel="USE EXTERNAL"
          isSelected={type === RepositoryType.EXTERNAL}
          onSelect={() => {
            clearError('type');
            updateValue('type', RepositoryType.EXTERNAL);
          }}
          Repository={<RepositoryTypeComponent squareLocation={LOCATION.OUT} />}
        />
        <RepositoryOption
          title="Internal Repository"
          subtitle="A new repository will be installed in the server. The version-control system used will be Gitea. Administrator right access will be granted to your repository account."
          actionLabel="USE INTERNAL"
          isSelected={type === RepositoryType.INTERNAL}
          onSelect={() => {
            clearError('type');
            updateValue('type', RepositoryType.INTERNAL);
          }}
          Repository={<RepositoryTypeComponent squareLocation={LOCATION.IN} />}
        />
      </div>
      {showErrors && <div className={styles.errorMessage}>{errors.type}</div>}
    </div>
  );
}

export default Repository;
