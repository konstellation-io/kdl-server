import React, { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { loadingRuntime, memberDetails, primaryPanel, runningRuntime, secondaryPanel } from 'Graphql/client/cache';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useMemberDetails from 'Graphql/client/hooks/useMemberDetails';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import Panel from 'Components/Layout/Panel/Panel';
import RuntimeRunner, { RuntimeAction } from 'Components/RuntimeRunner/RuntimeRunner';
import MemberDetails from './panels/MemberDetails/MemberDetails';
import ProjectSettings from './panels/ProjectSettings/ProjectSettings';
import UpdateProjectDescription from './panels/UpdateProjectDescription/UpdateProjectDescription';
import RuntimesList from './panels/RuntimesList/RuntimesList';
import RuntimeInfo from './panels/RuntimeInfo/RuntimeInfo';
import { Button } from 'kwc';
import IconPlay from '@material-ui/icons/PlayArrow';
import IconPause from '@material-ui/icons/Pause';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from 'Components/Tooltip/Tooltip';
import styles from './Project.module.scss';

const defaultPanel = 'settings';

type Props = {
  openedProject: GetProjects_projects;
};

function ProjectPanels({ openedProject }: Props) {
  const panel1Data = useReactiveVar(primaryPanel);
  const panel2Data = useReactiveVar(secondaryPanel);

  const memberDetailsData = useReactiveVar(memberDetails);
  const runtimeRunning = useReactiveVar(runningRuntime);
  const runtimeLoading = useReactiveVar(loadingRuntime);

  const selectedRuntime = panel2Data?.runtime ?? null;
  const isLoading = runtimeLoading !== null;

  const { closePanel: panel1Close } = usePanel(PanelType.PRIMARY);
  const { closePanel: panel2Close } = usePanel(PanelType.SECONDARY);
  const { unselectMemberDetails } = useMemberDetails();

  const tooltipProps = {
    effect: 'solid',
    textColor: 'white',
    backgroundColor: '#888',
    place: 'bottom',
  };

  // Opening a level 1 panel closes previous level 2 panels
  useEffect(() => {
    if (panel1Data) panel2Close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel1Data]);

  function closeMemberInfoPanel() {
    panel2Close();
    unselectMemberDetails();
  }

  function extraPanelButton(panelId?: string) {
    if (panelId === PANEL_ID.RUNTIME_INFO) {
      if (isLoading)
        return (
          <div key="circularProgress" className={styles.progressSpinerContainer}>
            <CircularProgress color="inherit" className={styles.loadingTools} size={12} />
          </div>
        );

      const pauseButtom = (
        <Tooltip tooltipId="stopPanel" spanText="Stop tools" tooltipProps={tooltipProps}>
          <div data-tip={true} data-for="stopPanel" data-testid="panelStopRuntime">
            <RuntimeRunner action={RuntimeAction.Stop}>
              <Button label="" Icon={IconPause} />
            </RuntimeRunner>
          </div>
        </Tooltip>
      );

      const startButton = (
        <Tooltip tooltipId="startPanel" spanText="Start tools" tooltipProps={tooltipProps}>
          <div data-tip={true} data-for="startPanel" data-testid="panelStartRuntime">
            <RuntimeRunner runtime={selectedRuntime ?? undefined} action={RuntimeAction.Start}>
              <Button label="" Icon={IconPlay} />
            </RuntimeRunner>
          </div>
        </Tooltip>
      );

      return selectedRuntime?.id === runtimeRunning?.id ? pauseButtom : startButton;
    }

    return null;
  }

  const panels: { [key in PANEL_ID]: JSX.Element | null } = {
    [PANEL_ID.SETTINGS]: <ProjectSettings project={openedProject} />,
    [PANEL_ID.PROJECT_DESCRIPTION]: <UpdateProjectDescription project={openedProject} close={panel2Close} />,
    [PANEL_ID.MEMBER_INFO]: memberDetailsData && (
      <MemberDetails member={memberDetailsData} close={closeMemberInfoPanel} projectId={openedProject.id} />
    ),
    [PANEL_ID.RUNTIMES_LIST]: <RuntimesList />,
    [PANEL_ID.RUNTIME_INFO]: selectedRuntime && (
      <RuntimeInfo selectedRuntime={selectedRuntime} isKubeconfigEnabled={true} />
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
        extraButton={extraPanelButton(panel2Data?.id)}
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
