import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GET_PRIMARY_PANEL,
  GetPrimaryPanel,
} from 'Graphql/client/queries/getPrimaryPanel.graphql';
import {
  GET_SECONDARY_PANEL,
  GetSecondaryPanel,
} from 'Graphql/client/queries/getSecondaryPanel.graphql';
import React, { useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import KGResults from './panels/KGResults/KGResults';
import MemberDetails from './panels/MemberDetails/MemberDetails';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import Panel from 'Components/Layout/Panel/Panel';
import ProjectSettings from './panels/ProjectSettings/ProjectSettings';
import UpdateProjectDescription from './panels/UpdateProjectDescription/UpdateProjectDescription';
import UpdateRepository from './panels/UpdateRepository/UpdateRepository';
import styles from './Project.module.scss';
import useMemberDetails from 'Graphql/client/hooks/useMemberDetails';
import { useQuery, useReactiveVar } from '@apollo/client';
import { memberDetails } from 'Graphql/client/cache';

export interface ProjectRoute {
  openedProject: GetProjects_projects;
}
function ProjectPanels({ openedProject }: ProjectRoute) {
  const {
    data: panel1Data,
    loading: panel1Loading,
    error: panel1Error,
  } = useQuery<GetPrimaryPanel>(GET_PRIMARY_PANEL);
  const {
    data: panel2Data,
    loading: panel2Loading,
    error: panel2Error,
  } = useQuery<GetSecondaryPanel>(GET_SECONDARY_PANEL);

  const memberDetailsData = useReactiveVar(memberDetails);

  const { closePanel: panel1Close } = usePanel(PanelType.PRIMARY);
  const { closePanel: panel2Close } = usePanel(PanelType.SECONDARY);
  const { unselectMemberDetails } = useMemberDetails();

  // Stores last opened tab inside project settings panel. When you reopen
  // this panel, last opened tab will remain opened.
  const [settingsOpenedTab, setSettingsOpenedTab] = useState(0);

  if (panel1Loading || panel2Loading || !panel1Data || !panel2Data)
    return <SpinnerCircular />;

  if (panel1Error || panel2Error) return <ErrorMessage />;

  function closeMemberInfoPanel() {
    panel2Close();
    unselectMemberDetails();
  }

  const panels: { [key in PANEL_ID]: JSX.Element | null } = {
    [PANEL_ID.SETTINGS]: (
      <ProjectSettings
        settingsOpenedTab={settingsOpenedTab}
        setSettingsOpenedTab={setSettingsOpenedTab}
      />
    ),
    [PANEL_ID.REPOSITORY_INFO]: (
      <UpdateRepository project={openedProject} close={panel2Close} />
    ),
    [PANEL_ID.PROJECT_DESCRIPTION]: (
      <UpdateProjectDescription project={openedProject} close={panel2Close} />
    ),
    [PANEL_ID.MEMBER_INFO]: memberDetailsData && (
      <MemberDetails
        member={memberDetailsData}
        close={closeMemberInfoPanel}
        projectId={openedProject.id}
      />
    ),
    [PANEL_ID.KG_RESULTS]: <KGResults />,
  };

  return (
    <div className={styles.panels}>
      <Panel
        title={panel1Data.primaryPanel?.title}
        show={!!panel1Data.primaryPanel}
        close={panel1Close}
        noShrink={!!panel1Data.primaryPanel?.fixedWidth}
        theme={panel1Data.primaryPanel?.theme}
        size={panel1Data.primaryPanel?.size}
      >
        {panels[panel1Data.primaryPanel?.id]}
      </Panel>
      <Panel
        title={panel2Data.secondaryPanel?.title}
        show={!!panel2Data.secondaryPanel}
        close={panel2Close}
        noShrink={!!panel2Data.secondaryPanel?.fixedWidth}
        theme={panel2Data.secondaryPanel?.theme}
        size={panel2Data.secondaryPanel?.size}
      >
        {panels[panel2Data.secondaryPanel?.id]}
      </Panel>
    </div>
  );
}

export default ProjectPanels;
