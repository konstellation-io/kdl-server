import {
  GET_OPENED_PROJECT,
  GetOpenedProject,
} from 'Graphql/client/queries/getOpenedProject.graphql';
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
import { useQuery } from '@apollo/client';

type Props = {
  settingsOpenedTab: number;
  setSettingsOpenedTab: (index: number) => void;
};
function ProjectSettings({ settingsOpenedTab, setSettingsOpenedTab }: Props) {
  const { data: localData } = useQuery<GetOpenedProject>(GET_OPENED_PROJECT);
  const openedProject = localData?.openedProject;

  if (!openedProject || !openedProject.repository) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <ProjectInfo project={openedProject} />
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
            <TabInfo project={openedProject} />
          </TabPanel>
          <TabPanel>
            <TabGit repository={openedProject.repository} />
          </TabPanel>
          <TabPanel>
            <TabMembers projectId={openedProject.id} />
          </TabPanel>
          <TabPanel>
            <TabDangerZone />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ProjectSettings;
