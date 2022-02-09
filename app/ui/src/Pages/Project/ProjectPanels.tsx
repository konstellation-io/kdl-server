import React, { useEffect } from 'react';
import { memberDetails, primaryPanel, runningRuntime, secondaryPanel, selectedRuntime } from 'Graphql/client/cache';
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
import RuntimesList from './panels/RuntimesList/RuntimesList';
import RuntimeInfo from './panels/RuntimeInfo/RuntimeInfo';
import { Button } from 'kwc';
import IconPlay from '@material-ui/icons/PlayArrow';
import IconPause from '@material-ui/icons/Pause';
import useRuntime from 'Graphql/client/hooks/useRuntime';

const defaultPanel = 'settings';

type Props = {
  openedProject: GetProjects_projects;
};

function ProjectPanels({ openedProject }: Props) {
  const panel1Data = useReactiveVar(primaryPanel);
  const panel2Data = useReactiveVar(secondaryPanel);

  const memberDetailsData = useReactiveVar(memberDetails);
  const runtimeSelected = useReactiveVar(selectedRuntime);
  const runtimeRunning = useReactiveVar(runningRuntime);

  const { startRuntime, pauseRuntime } = useRuntime();

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

  function runtimeStart() {
    startRuntime(runtimeSelected);
  }

  function extraPanelButtons(panelId?: string) {
    if (panelId === PANEL_ID.RUNTIME_INFO) {
      return runtimeSelected?.id === runtimeRunning?.id
        ? [<Button key="toggleRuntime" label="" Icon={IconPause} onClick={pauseRuntime} />]
        : [<Button key="toggleRuntime" label="" Icon={IconPlay} onClick={runtimeStart} />];
    }

    return [];
  }

  const panels: { [key in PANEL_ID]: JSX.Element | null } = {
    [PANEL_ID.SETTINGS]: <ProjectSettings project={openedProject} />,
    [PANEL_ID.PROJECT_DESCRIPTION]: <UpdateProjectDescription project={openedProject} close={panel2Close} />,
    [PANEL_ID.MEMBER_INFO]: memberDetailsData && (
      <MemberDetails member={memberDetailsData} close={closeMemberInfoPanel} projectId={openedProject.id} />
    ),
    [PANEL_ID.RUNTIMES_LIST]: <RuntimesList />,
    [PANEL_ID.RUNTIME_INFO]: runtimeSelected && <RuntimeInfo selectedRuntime={runtimeSelected} />,
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
        extraButtons={extraPanelButtons(panel2Data?.id)}
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
