import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from 'Pages/Home/pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';
import usePanel, { PanelType } from 'Pages/Home/apollo/hooks/usePanel';

import { Button } from 'kwc';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { GetProjects_projects_repository } from 'Graphql/queries/types/GetProjects';
import IconEdit from '@material-ui/icons/Edit';
import { PANEL_ID } from 'Pages/Home/apollo/models/Panel';
import { PANEL_SIZE } from 'Components/Layout/Panel/Panel';
import React from 'react';
import { RepositoryType } from 'Graphql/types/globalTypes';
import styles from './TabGit.module.scss';

type Props = {
  repository: GetProjects_projects_repository;
};
function TabGit({ repository }: Props) {
  const isExternal = repository.type === RepositoryType.EXTERNAL;
  const { openPanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.REPOSITORY_INFO,
    title: 'Edit Repository Information',
    isDark: true,
    size: PANEL_SIZE.BIG,
  });

  return (
    <div className={styles.container}>
      <div className={styles.edit}>
        <Button label="" Icon={IconEdit} onClick={openPanel} />
      </div>
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
      <div className={styles.log}>
        <p className={styles.title}>REPOSITORY LOG</p>
        <div className={styles.content}>
          {
            'Commit		65465468798790870654650640\n\
          Autohor: 	Some Konstellation User <some.konstellation-user@konstellation.io>\n\
          Date: 		Thu May 21 14:10:05 2020 +0200\n\
          \n\
          Add model parameters input reader'
          }
        </div>
      </div>
    </div>
  );
}

export default TabGit;
