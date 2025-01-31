import RepositoryIcon, { LOCATION, SIZE } from 'Pages/NewProject/pages/RepositoryIcon/RepositoryIcon';

import { ErrorMessage } from 'kwc';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import React from 'react';
import styles from './TabMinio.module.scss';
import { useQuery } from '@apollo/client';
import GetMeQuery from 'Graphql/queries/getMe';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { Button } from 'kwc';
import { copyAndToast } from 'Utils/clipboard';

type Props = {
  project: GetProjects_projects;
};
function TabGit({ project }: Props) {
  const { minioAccessKey } = project;
  const { data: loading, error } = useQuery<GetMe>(GetMeQuery);

  if (!minioAccessKey || error || !loading) return <ErrorMessage />;

  return (
    <div className={styles.container} data-testid="tabGit">
      <p className={styles.fieldLabel}>ACCESS KEY</p>
      <div className={styles.accessKey}>
        <p>{minioAccessKey.accessKey}</p>
        <CopyToClipboard>{minioAccessKey.accessKey}</CopyToClipboard>
      </div>
      <div>
        <p className={styles.fieldLabel}>SECRET KEY</p>
        <div className={styles.key}>
          <div className={styles.keyValue} title={'Secret Key'}>
            {minioAccessKey.secretKey}
          </div>
          <p className={styles.copyPre}>TO SEE THE KEY, JUST</p>
          <Button
            className={styles.copy}
            label="Copy it"
            onClick={() => copyAndToast(minioAccessKey.secretKey)}
            height={30}
          />
        </div>
      </div>
    </div>
  );
}

export default TabGit;
