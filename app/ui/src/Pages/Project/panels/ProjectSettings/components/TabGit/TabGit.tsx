import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from 'Pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';

import { Button } from 'kwc';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { GetProjects_projects_repository } from 'Graphql/queries/types/GetProjects';
import IconEdit from '@material-ui/icons/Edit';
import { PANEL_ID } from 'Graphql/client/models/Panel';
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
    theme: PANEL_THEME.DARK,
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
    </div>
  );
}

export default TabGit;
