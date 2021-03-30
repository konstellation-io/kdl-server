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
function UpdateRepository({ project, close }: UpdateRepoProps) {
  const isExternalRepo = project.repository?.type === RepositoryType.EXTERNAL;

  return (
    <div className={styles.wrapper}>
      {isExternalRepo ? (
        <UpdateExternalRepo close={close} project={project} />
      ) : (
        <UpdateInternalRepo close={close} project={project} />
      )}
    </div>
  );
}

export default UpdateRepository;
