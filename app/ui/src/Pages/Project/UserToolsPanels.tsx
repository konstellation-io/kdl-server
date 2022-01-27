import React, { useEffect } from 'react';
import { primaryPanel, secondaryPanel } from 'Graphql/client/cache';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { USERTOOLS_PANEL_ID } from 'Graphql/client/models/Panel';
import Panel from 'Components/Layout/Panel/Panel';
import styles from './Project.module.scss';
import { useReactiveVar } from '@apollo/client';
import RuntimesList from './panels/RuntimesList/RuntimesList';
import RuntimeInfo from './panels/RuntimeInfo/RuntimeInfo';
import { GetRuntimes_runtimes } from '../../Graphql/queries/types/GetRuntimes';

const defaultPanel = USERTOOLS_PANEL_ID.RUNTIMES_LIST;

function UserToolsPanels() {
  const panel1Data = useReactiveVar(primaryPanel);
  const panel2Data = useReactiveVar(secondaryPanel);

  const { closePanel: panel1Close } = usePanel(PanelType.PRIMARY);
  const { closePanel: panel2Close } = usePanel(PanelType.SECONDARY);

  const selectedRuntime: GetRuntimes_runtimes = {
    __typename: 'Runtime',
    id: '',
    name: '',
    desc: '',
    labels: [],
    DockerImage: '',
  };

  // Opening a level 1 panel closes previous level 2 panels
  useEffect(() => {
    if (panel1Data) panel2Close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel1Data]);

  const panels: { [key in USERTOOLS_PANEL_ID]: JSX.Element | null } = {
    [USERTOOLS_PANEL_ID.RUNTIMES_LIST]: <RuntimesList />,
    [USERTOOLS_PANEL_ID.RUNTIME_INFO]: <RuntimeInfo selectedRuntime={selectedRuntime} close={panel2Close} />,
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
        {panels[(panel1Data?.id as USERTOOLS_PANEL_ID) || defaultPanel]}
      </Panel>
      <Panel
        title={panel2Data?.title}
        show={!!panel2Data}
        close={panel2Close}
        noShrink={!!panel2Data?.fixedWidth}
        theme={panel2Data?.theme}
        size={panel2Data?.size}
      >
        {panels[(panel2Data?.id as USERTOOLS_PANEL_ID) || defaultPanel]}
      </Panel>
    </div>
  );
}

export default UserToolsPanels;
