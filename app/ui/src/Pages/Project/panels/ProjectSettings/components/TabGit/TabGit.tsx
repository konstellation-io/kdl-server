import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from 'Pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';

import { ErrorMessage, SpinnerCircular } from 'kwc';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import React from 'react';
import { RepositoryType } from 'Graphql/types/globalTypes';
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

  if (loading) return <SpinnerCircular />;
  if (!repository || error) return <ErrorMessage />;

  const isExternal = repository.type === RepositoryType.EXTERNAL;

  return (
    <div className={styles.container} data-testid="tabGit">
      <div className={styles.repoType}>
        <RepositoryTypeComponent
          squareLocation={isExternal ? LOCATION.OUT : LOCATION.IN}
          size={SIZE.TINY}
          shouldAnimate={false}
        />
        <p className={styles.repoTypeName}>{`${repository.type} REPOSITORY`}</p>
      </div>
      <div className={styles.url}>
        <p>{repository.url}</p>
        <CopyToClipboard>{repository.url}</CopyToClipboard>
      </div>
    </div>
  );
}

export default TabGit;
