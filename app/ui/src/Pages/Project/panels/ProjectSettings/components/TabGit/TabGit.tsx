import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from 'Pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';

import { Button, ErrorMessage, SpinnerCircular } from 'kwc';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import IconEdit from '@material-ui/icons/Edit';
import React, { useMemo } from 'react';
import { AccessLevel, RepositoryType } from 'Graphql/types/globalTypes';
import styles from './TabGit.module.scss';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

type Props = {
  project: GetProjects_projects;
};
function TabGit({ project }: Props) {
  const { toolUrls, repository, members } = project;
  const { data: dataMe, loading, error } = useQuery<GetMe>(GetMeQuery);

  const isAdmin = useMemo(() => {
    const meAsMember = members.find((m) => m.user.email === dataMe?.me.email);
    if (meAsMember) return meAsMember.accessLevel === AccessLevel.ADMIN;
  }, [dataMe, members]);

  if (loading) return <SpinnerCircular />;
  if (!repository || error) return <ErrorMessage />;

  const isExternal = repository.type === RepositoryType.EXTERNAL;

  function openExternalRepoSettings() {
    const projectGiteaUrl = new URL(toolUrls.gitea);
    projectGiteaUrl.pathname += '/settings';

    window.open(projectGiteaUrl.toString());
  }

  return (
    <div className={styles.container}>
      {isAdmin && isExternal && (
        <div className={styles.edit}>
          <Button label="" Icon={IconEdit} onClick={openExternalRepoSettings} />
        </div>
      )}
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
