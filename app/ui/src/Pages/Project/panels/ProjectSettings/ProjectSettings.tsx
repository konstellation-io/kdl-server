import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { ErrorMessage } from 'kwc';
import ProjectInfo from './components/ProjectInfo/ProjectInfo';
import React from 'react';
import TabDangerZone from './components/TabDangerZone/TabDangerZone';
import TabGit from './components/TabGit/TabGit';
import TabInfo from './components/TabInfo/TabInfo';
import TabMembers from './components/TabMembers/TabMembers';
import cx from 'classnames';
import styles from './ProjectSettings.module.scss';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';

type Props = {
  project: GetProjects_projects;
  settingsOpenedTab: number;
  setSettingsOpenedTab: (index: number) => void;
};
function ProjectSettings({
  settingsOpenedTab,
  setSettingsOpenedTab,
  project,
}: Props) {
  if (!project.repository) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <ProjectInfo project={project} />
      </div>
      <Tabs onSelect={setSettingsOpenedTab} selectedIndex={settingsOpenedTab}>
        <TabList>
          <Tab>INFO</Tab>
          <Tab>GIT</Tab>
          <Tab>MEMBERS</Tab>
          <Tab className={cx('react-tabs__tab', 'danger-tab')}>DANGER ZONE</Tab>
        </TabList>

        <div className={styles.tabContent}>
          <TabPanel>
            <TabInfo project={project} />
          </TabPanel>
          <TabPanel>
            <TabGit project={project} />
          </TabPanel>
          <TabPanel>
            <TabMembers projectId={project.id} />
          </TabPanel>
          <TabPanel>
            <TabDangerZone projectId={project.id} />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ProjectSettings;
