import RepositoryIcon, { LOCATION, SIZE } from 'Pages/NewProject/pages/RepositoryIcon/RepositoryIcon';

import { ErrorMessage } from 'kwc';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import React from 'react';
import styles from './TabGit.module.scss';
import { useQuery } from '@apollo/client';
import GetMeQuery from 'Graphql/queries/getMe';
import { GetMe } from 'Graphql/queries/types/GetMe';

type Props = {
  project: GetProjects_projects;
};
function TabGit({ project }: Props) {
  const { repository } = project;
  const { data: loading, error } = useQuery<GetMe>(GetMeQuery);

  if (!repository || error) return <ErrorMessage />;

  return (
    <div className={styles.container} data-testid="tabGit">
      <div className={styles.repoType}>
        <RepositoryIcon squareLocation={LOCATION.OUT} size={SIZE.TINY} shouldAnimate={false} />
        <p className={styles.repoTypeName}>REPOSITORY URL</p>
      </div>
      <div className={styles.url}>
        <p>{repository.url}</p>
        <CopyToClipboard>{repository.url}</CopyToClipboard>
      </div>
    </div>
  );
}

export default TabGit;
