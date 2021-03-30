import React from 'react';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import styles from './UpdateRepository.module.scss';
import { RepositoryType } from 'Graphql/types/globalTypes';
import UpdateExternalRepo from './components/UpdateExternalRepo/UpdateExternalRepo';
import UpdateInternalRepo from './components/UpdateInternalRepo/UpdateInternalRepo';

export type UpdateRepoProps = {
  project: GetProjects_projects;
  close: () => void;
};
function UpdateRepository(props: UpdateRepoProps) {
  const isExternal = props.project.repository?.type === RepositoryType.EXTERNAL;

  return (
    <div className={styles.wrapper}>
      {isExternal ? (
        <UpdateExternalRepo {...props} />
      ) : (
        <UpdateInternalRepo {...props} />
      )}
    </div>
  );
}

export default UpdateRepository;
