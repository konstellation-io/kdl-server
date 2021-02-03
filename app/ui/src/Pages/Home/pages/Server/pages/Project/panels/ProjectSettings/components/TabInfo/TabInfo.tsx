import React, { useState } from 'react';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { TextInput } from 'kwc';
import styles from './TabInfo.module.scss';
import useProject from 'Graphql/hooks/useProject';

type Props = {
  project: GetProjects_projects;
};
function TabInfo({ project }: Props) {
  const { updateProjectName } = useProject();
  const [newName, setNewName] = useState(project.name);

  return (
    <div className={styles.container}>
      <TextInput
        label="project name"
        formValue={newName}
        onChange={(value: string) => setNewName(value)}
        onBlur={() => updateProjectName(project.id, newName)}
        showClearButton
      />
      <div className={styles.description}>
        <p className={styles.title}>ABSTRACT</p>
        <div className={styles.content}>{project.description}</div>
      </div>
    </div>
  );
}

export default TabInfo;
