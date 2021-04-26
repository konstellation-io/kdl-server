import { NavLink, useParams, useRouteMatch } from 'react-router-dom';
import React, { FC, useEffect, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useWorkspace, { CONFIG } from 'Hooks/useWorkspace';

import IconCollapse from '@material-ui/icons/KeyboardBackspace';
import IconKGViewer from 'Components/Icons/AutoStories';
import IconSettings from '@material-ui/icons/Settings';
import NavElements from './components/NavElements/NavElements';
import NavigationButton from './components/NavigationButton/NavigationButton';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import ROUTE, { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import navButtonStyles from './components/NavigationButton/NavigationButton.module.scss';
import styles from './ProjectNavigation.module.scss';
import { useReactiveVar } from '@apollo/client';
import { primaryPanel } from 'Graphql/client/cache';

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

const SETTINGS_PANEL_OPTIONS = {
  id: PANEL_ID.SETTINGS,
  title: 'Settings',
  fixedWidth: true,
};
const KG_PANEL_OPTIONS = {
  id: PANEL_ID.KG_RESULTS,
  title: 'Knowledge Viewer',
};

function ProjectNavigation() {
  const atKGRoute = useRouteMatch(ROUTE.PROJECT_KG)?.isExact;
  const { projectId } = useParams<RouteProjectParams>();
  const [{ navigationOpened }, saveConfiguration] = useWorkspace(projectId);
  const [opened, setOpened] = useState(navigationOpened);

  const panelData = useReactiveVar(primaryPanel);
  const { openPanel: openSettings, closePanel: closeSettings } = usePanel(
    PanelType.PRIMARY,
    SETTINGS_PANEL_OPTIONS
  );
  const { openPanel: openKGPanel, closePanel: closeKGPanel } = usePanel(
    PanelType.PRIMARY,
    KG_PANEL_OPTIONS
  );

  // Closes KG Results panel when entering Knowledge Galaxy view
  useEffect(() => {
    if (atKGRoute && panelData?.id === PANEL_ID.KG_RESULTS) closeKGPanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atKGRoute]);

  function onToggleOpened() {
    setOpened(!opened);
    saveConfiguration(CONFIG.NAVIGATION_OPENED, !opened);
  }

  function toggleSettingsPanel() {
    const shouldOpen = !panelData || panelData.id !== PANEL_ID.SETTINGS;

    if (shouldOpen) openSettings();
    else closeSettings();
  }

  function toggleKGPanel() {
    const shouldOpen = !panelData || panelData.id !== PANEL_ID.KG_RESULTS;

    if (shouldOpen) openKGPanel();
    else closeKGPanel();
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
          disabled={!!atKGRoute}
        />
        <NavigationButton
          onClick={toggleSettingsPanel}
          label="Settings"
          Icon={IconSettings}
        />
        <NavigationButton
          label="Collapse"
          title={opened ? 'Collapse' : 'Expand'}
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
