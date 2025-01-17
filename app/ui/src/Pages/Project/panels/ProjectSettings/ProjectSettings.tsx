import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { ErrorMessage } from 'kwc';
import ProjectInfo from './components/ProjectInfo/ProjectInfo';
import * as React from 'react';
import TabDangerZone from './components/TabDangerZone/TabDangerZone';
import TabGit from './components/TabGit/TabGit';
import TabInfo from './components/TabInfo/TabInfo';
import TabMembers from './components/TabMembers/TabMembers';
import TabMinio from './components/TabMinio/TabMinio';
import cx from 'classnames';
import styles from './ProjectSettings.module.scss';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { useReactiveVar } from '@apollo/client';
import { openedSettingTab } from 'Graphql/client/cache';
import useSettingTabs from 'Graphql/client/hooks/useSettingTabs';
import { useQuery } from '@apollo/client';
import { GetMe } from 'Graphql/queries/types/GetMe';
import GetMeQuery from 'Graphql/queries/getMe';
import { AccessLevel } from 'Graphql/types/globalTypes';

type Props = {
  project: GetProjects_projects;
};
function ProjectSettings({ project }: Props) {
  const openedTab = useReactiveVar(openedSettingTab);
  const { updateSettingTab } = useSettingTabs();

  const { data, loading, error } = useQuery<GetMe>(GetMeQuery);

  const hasAccess = data?.me.accessLevel != AccessLevel.VIEWER;

  if (!project.repository) return <ErrorMessage />;

  return (
    <div className={styles.container} data-testid="settingsPanel">
      <div className={styles.info}>
        <ProjectInfo project={project} />
      </div>
      <Tabs onSelect={updateSettingTab} selectedIndex={openedTab}>
        <TabList>
          <Tab>INFO</Tab>
          <Tab>GIT</Tab>
          <Tab>MINIO</Tab>
          <Tab data-testid="tabMembers">USERS</Tab>
          {hasAccess && <Tab className={cx('react-tabs__tab', 'danger-tab')}>ADMIN</Tab>}
        </TabList>

        <div className={styles.tabContent}>
          <TabPanel className={styles.tab} selectedClassName={styles.selectedTab}>
            <TabInfo project={project} hasAccess={hasAccess} />
          </TabPanel>
          <TabPanel className={styles.tab} selectedClassName={styles.selectedTab}>
            <TabGit project={project} />
          </TabPanel>
          <TabPanel className={styles.tab} selectedClassName={styles.selectedTab}>
            <TabMinio project={project} />
          </TabPanel>
          <TabPanel className={styles.tab} selectedClassName={styles.selectedTab}>
            <TabMembers projectId={project.id} hasAccess={hasAccess} />
          </TabPanel>
          <TabPanel className={styles.tab} selectedClassName={styles.selectedTab}>
            <TabDangerZone projectId={project.id} projectName={project.name} />
          </TabPanel>
          {hasAccess && (
            <TabPanel className={styles.tab} selectedClassName={styles.selectedTab}>
              <TabDangerZone projectId={project.id} projectName={project.name} />
            </TabPanel>
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default ProjectSettings;
