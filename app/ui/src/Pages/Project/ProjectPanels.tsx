import React, { useEffect } from 'react';
import { memberDetails, primaryPanel, secondaryPanel } from 'Graphql/client/cache';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import MemberDetails from './panels/MemberDetails/MemberDetails';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import Panel from 'Components/Layout/Panel/Panel';
import ProjectSettings from './panels/ProjectSettings/ProjectSettings';
import UpdateProjectDescription from './panels/UpdateProjectDescription/UpdateProjectDescription';
import styles from './Project.module.scss';
import useMemberDetails from 'Graphql/client/hooks/useMemberDetails';
import { useReactiveVar } from '@apollo/client';

const defaultPanel = 'settings';

export interface ProjectRoute {
  openedProject: GetProjects_projects;
}
function ProjectPanels({ openedProject }: ProjectRoute) {
  const panel1Data = useReactiveVar(primaryPanel);
  const panel2Data = useReactiveVar(secondaryPanel);

  const memberDetailsData = useReactiveVar(memberDetails);

  const { closePanel: panel1Close } = usePanel(PanelType.PRIMARY);
  const { closePanel: panel2Close } = usePanel(PanelType.SECONDARY);
  const { unselectMemberDetails } = useMemberDetails();

  // Opening a level 1 panel closes previous level 2 panels
  useEffect(() => {
    if (panel1Data) panel2Close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel1Data]);

  function closeMemberInfoPanel() {
    panel2Close();
    unselectMemberDetails();
  }

  const panels: { [key in PANEL_ID]: JSX.Element | null } = {
    [PANEL_ID.SETTINGS]: <ProjectSettings project={openedProject} />,
    [PANEL_ID.PROJECT_DESCRIPTION]: <UpdateProjectDescription project={openedProject} close={panel2Close} />,
    [PANEL_ID.MEMBER_INFO]: memberDetailsData && (
      <MemberDetails member={memberDetailsData} close={closeMemberInfoPanel} projectId={openedProject.id} />
    ),
  };

  return (
    <div className={styles.panels}>
      <Panel
        title={panel1Data?.title}
        show={!!panel1Data}
        close={panel1Close}
        noShrink={!!panel1Data?.fixedWidth}
        theme={panel1Data?.theme}
        size={panel1Data?.size}
      >
        {panels[panel1Data?.id || defaultPanel]}
      </Panel>
      <Panel
        title={panel2Data?.title}
        show={!!panel2Data}
        close={panel2Close}
        noShrink={!!panel2Data?.fixedWidth}
        theme={panel2Data?.theme}
        size={panel2Data?.size}
      >
        {panels[panel2Data?.id || defaultPanel]}
      </Panel>
    </div>
  );
}

export default ProjectPanels;
