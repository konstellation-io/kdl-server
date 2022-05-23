import RepositoryTypeComponent, { LOCATION } from './components/RepositoryTypeComponent/RepositoryTypeComponent';
import * as React from 'react';
import RepositoryOption from './components/RepositoryOption/RepositoryOption';
import { RepositoryType } from 'Graphql/types/globalTypes';
import cx from 'classnames';
import styles from './Repository.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';

function Repository(params: { showErrors: boolean }) {
  const { showErrors } = params;
  const { updateValue, clearError } = useNewProject('repository');
  const {
    repository: { values, errors },
  } = useReactiveVar(newProject);

  return (
    <div className={styles.container}>
      <div
        className={cx(styles.repositories, {
          [styles.error]: showErrors && errors.type,
        })}
      >
        <RepositoryOption
          dataTestId={RepositoryType.EXTERNAL}
          title="External Repository"
          subtitle="You will connect to a version-control system located outside the Server. Make sure you can access the repository before trying to connect to and include your SSH key inside it."
          actionLabel="USE EXTERNAL"
          isSelected={values.type === RepositoryType.EXTERNAL}
          onSelect={() => {
            clearError('type');
            updateValue('type', RepositoryType.EXTERNAL);
          }}
          Repository={<RepositoryTypeComponent squareLocation={LOCATION.OUT} />}
        />
      </div>
      {showErrors && <div className={styles.errorMessage}>{errors.type}</div>}
    </div>
  );
}

export default Repository;
