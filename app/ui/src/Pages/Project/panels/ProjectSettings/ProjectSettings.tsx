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
import { useReactiveVar } from '@apollo/client';
import { openedSettingTab } from 'Graphql/client/cache';
import useSettingTabs from 'Graphql/client/hooks/useSettingTabs';

type Props = {
  project: GetProjects_projects;
};
function ProjectSettings({ project }: Props) {
  const openedTab = useReactiveVar(openedSettingTab);
  const { updateSettingTab } = useSettingTabs();

  if (!project.repository) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <ProjectInfo project={project} />
      </div>
      <Tabs onSelect={updateSettingTab} selectedIndex={openedTab}>
        <TabList>
          <Tab>INFO</Tab>
          <Tab>GIT</Tab>
          <Tab>MEMBERS</Tab>
          <Tab className={cx('react-tabs__tab', 'danger-tab')}>DANGER ZONE</Tab>
        </TabList>

        <div className={styles.tabContent}>
          <TabPanel
            className={styles.tab}
            selectedClassName={styles.selectedTab}
          >
            <TabInfo project={project} />
          </TabPanel>
          <TabPanel
            className={styles.tab}
            selectedClassName={styles.selectedTab}
          >
            <TabGit project={project} />
          </TabPanel>
          <TabPanel
            className={styles.tab}
            selectedClassName={styles.selectedTab}
          >
            <TabMembers projectId={project.id} />
          </TabPanel>
          <TabPanel
            className={styles.tab}
            selectedClassName={styles.selectedTab}
          >
            <TabDangerZone projectId={project.id} />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ProjectSettings;
