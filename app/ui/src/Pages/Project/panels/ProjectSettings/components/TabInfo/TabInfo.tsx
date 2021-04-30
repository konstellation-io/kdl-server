import { Button, TextInput } from 'kwc';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import React, { useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import IconEdit from '@material-ui/icons/Edit';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import styles from './TabInfo.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { toast } from 'react-toastify';

type Props = {
  project: GetProjects_projects;
};
function TabInfo({ project }: Props) {
  const { updateProjectName } = useProject({
    onUpdateCompleted: () => toast.info('The project name has been updated'),
  });
  const [newName, setNewName] = useState(project.name);
  const { openPanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.PROJECT_DESCRIPTION,
    title: 'Project Description (Abstract)',
    size: PANEL_SIZE.BIG,
    theme: PANEL_THEME.LIGHT,
  });

  return (
    <div className={styles.container}>
      <TextInput
        label="project name"
        formValue={newName}
        onChange={(value: string) => setNewName(value)}
        onBlur={() => updateProjectName(project.id, newName)}
        showClearButton
      />
      <div className={styles.projectIdWrapper}>
        <span className={styles.projectIdLabel}>PROJECT ID</span>
        <span className={styles.projectId}>{project.id}</span>
      </div>
      <div className={styles.description}>
        <p className={styles.title}>ABSTRACT</p>
        <div className={styles.button}>
          <Button label="" Icon={IconEdit} onClick={openPanel} />
        </div>
        <div className={styles.content}>{project.description}</div>
      </div>
    </div>
  );
}

export default TabInfo;
