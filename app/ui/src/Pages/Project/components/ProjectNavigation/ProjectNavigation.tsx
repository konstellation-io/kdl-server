import { NavLink, useParams } from 'react-router-dom';
import React, { FC, useRef, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useWorkspace, { CONFIG } from 'Hooks/useWorkspace';

import IconCollapse from '@material-ui/icons/KeyboardBackspace';
import IconKGViewer from '@material-ui/icons/OpenInBrowser';
import IconSettings from '@material-ui/icons/Settings';
import NavElements from './components/NavElements/NavElements';
import NavigationButton from './components/NavigationButton/NavigationButton';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import navButtonStyles from './components/NavigationButton/NavigationButton.module.scss';
import styles from './ProjectNavigation.module.scss';

export const NavButtonLink: FC<any> = ({ children, ...props }) => {
  return (
    <NavLink
      {...props}
      activeClassName={navButtonStyles.active}
      className={cx({ [navButtonStyles.disabled]: props.disabled })}
      exact
    >
      {children}
    </NavLink>
  );
};

enum Panels {
  SETTINGS,
  KG,
}

function ProjectNavigation() {
  const { projectId } = useParams<RouteProjectParams>();
  const [{ navigationOpened }, saveConfiguration] = useWorkspace(projectId);
  const [opened, setOpened] = useState(navigationOpened);
  const panelOpened = useRef<Panels | null>(null);

  const {
    openPanel: openSettingsPanel,
    closePanel: closeSettingsPanel,
  } = usePanel(PanelType.PRIMARY, {
    id: PANEL_ID.SETTINGS,
    title: 'Settings',
    fixedWidth: true,
  });
  const { openPanel: openKGPanel, closePanel: closeKGPanel } = usePanel(
    PanelType.PRIMARY,
    {
      id: PANEL_ID.KG_RESULTS,
      title: 'Knowledge Viewer',
      fixedWidth: true,
    }
  );

  function onToggleOpened() {
    setOpened(!opened);
    saveConfiguration(CONFIG.NAVIGATION_OPENED, !opened);
  }

  function toggleSettingsPanel() {
    const shouldOpen = panelOpened.current !== Panels.SETTINGS;
    if (shouldOpen) {
      openSettingsPanel();
    } else {
      closeSettingsPanel();
    }

    panelOpened.current = shouldOpen ? Panels.SETTINGS : null;
  }

  function toggleKGPanel() {
    const shouldOpen = panelOpened.current !== Panels.KG;
    if (shouldOpen) {
      openKGPanel();
    } else {
      closeKGPanel();
    }

    panelOpened.current = shouldOpen ? Panels.KG : null;
  }

  return (
    <div className={cx(styles.container, { [styles.opened]: opened })}>
      <div className={styles.top}>
        <NavElements isOpened={opened} />
      </div>
      <div className={styles.bottom}>
        <NavigationButton
          onClick={toggleKGPanel}
          label="Knowledge Viewer"
          Icon={IconKGViewer}
        />
        <NavigationButton
          onClick={toggleSettingsPanel}
          label="Settings"
          Icon={IconSettings}
        />
        <NavigationButton
          label="Collapse"
          title={opened ? 'COLLAPSE' : 'EXPAND'}
          Icon={IconCollapse}
          onClick={onToggleOpened}
          className={cx({
            [navButtonStyles.collapsed]: !opened,
          })}
        />
      </div>
    </div>
  );
}

export default ProjectNavigation;
