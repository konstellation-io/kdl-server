import { ErrorMessage, SpinnerCircular } from 'kwc';
import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from 'Pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';

import DescriptionScore from 'Components/DescriptionScore/DescriptionScore';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import React from 'react';
import { RepositoryType } from 'Graphql/types/globalTypes';
import styles from './Overview.module.scss';
import useQualityDescription from 'Hooks/useQualityDescription/useQualityDescription';
import useSettingTabs from 'Graphql/client/hooks/useSettingTabs';
import { SettingsTab } from 'Graphql/client/models/SettingsTab';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { SETTINGS_PANEL_OPTIONS } from '../../panelSettings';

type Props = {
  openedProject: GetProjects_projects;
};
function Overview({ openedProject }: Props) {
  const { openPanel: openSettings } = usePanel(
    PanelType.PRIMARY,
    SETTINGS_PANEL_OPTIONS
  );
  const { updateSettingTab } = useSettingTabs();

  const {
    descriptionScore,
    loading,
    error,
  } = useQualityDescription(openedProject.description, { skipFirstRun: false });

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  function handleMembersClick() {
    updateSettingTab(SettingsTab.MEMBERS);
    openSettings();
  }
  function handleRepoClick() {
    updateSettingTab(SettingsTab.REPOSITORY);
    openSettings();
  }

  return (
    <div className={styles.container}>
      <h1>Overview</h1>
      <div className={styles.projectData}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>PROJECT NAME</div>
          <div className={styles.name}>{openedProject.name}</div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>PROJECT ID</div>
          <div className={styles.name}>{openedProject.id}</div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>ABSTRACT</div>
          <div className={styles.description}>{openedProject.description}</div>
        </div>
        <div className={styles.section}>
          <DescriptionScore score={descriptionScore} />
        </div>
        <div className={styles.section}>
          <div className={styles.repoType} onClick={handleRepoClick}>
            <RepositoryTypeComponent
              squareLocation={
                openedProject.repository?.type === RepositoryType.EXTERNAL
                  ? LOCATION.OUT
                  : LOCATION.IN
              }
              size={SIZE.TINY}
              shouldAnimate={false}
            />
            <p
              className={styles.repoTypeName}
            >{`${openedProject.repository?.type} REPOSITORY`}</p>
          </div>
          <div
            className={styles.nMembers}
            onClick={handleMembersClick}
          >{`${openedProject.members.length} members`}</div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
