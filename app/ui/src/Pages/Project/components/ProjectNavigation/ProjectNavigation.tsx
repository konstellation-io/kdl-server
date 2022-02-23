import { NavLink, useParams } from 'react-router-dom';
import React, { FC, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useWorkspace, { CONFIG } from 'Hooks/useWorkspace';

import IconCollapse from '@material-ui/icons/KeyboardBackspace';
import IconSettings from '@material-ui/icons/Settings';
import NavElements from './components/NavElements/NavElements';
import NavigationButton from './components/NavigationButton/NavigationButton';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import navButtonStyles from './components/NavigationButton/NavigationButton.module.scss';
import styles from './ProjectNavigation.module.scss';
import { useReactiveVar } from '@apollo/client';
import { primaryPanel } from 'Graphql/client/cache';
import { SETTINGS_PANEL_OPTIONS } from '../../panelSettings';

type Props = {
  children: JSX.Element;
  to: string;
  key: string;
  disabled?: boolean;
};

export const NavButtonLink: FC<Props> = ({ children, ...props }) => {
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

function ProjectNavigation() {
  const { projectId } = useParams<RouteProjectParams>();
  const [{ navigationOpened }, saveConfiguration] = useWorkspace(projectId);
  const [opened, setOpened] = useState(navigationOpened);

  const panelData = useReactiveVar(primaryPanel);
  const { openPanel: openSettings, closePanel: closeSettings } = usePanel(PanelType.PRIMARY, SETTINGS_PANEL_OPTIONS);

  function onToggleOpened() {
    setOpened(!opened);
    saveConfiguration(CONFIG.NAVIGATION_OPENED, !opened);
  }

  function toggleSettingsPanel() {
    const shouldOpen = !panelData || panelData.id !== PANEL_ID.SETTINGS;

    if (shouldOpen) openSettings();
    else closeSettings();
  }

  return (
    <div className={cx(styles.container, { [styles.opened]: opened })} data-testid="navigationBar">
      <div className={styles.top}>
        <NavElements isOpened={opened} />
      </div>
      <div className={styles.bottom}>
        <NavigationButton
          dataTestId="toggleSettings"
          onClick={toggleSettingsPanel}
          label="Settings"
          Icon={IconSettings}
          isNavCollapsed={!opened}
        />
        <NavigationButton
          dataTestId="toggleBar"
          label="Collapse"
          title={opened ? 'Collapse' : 'Expand'}
          Icon={IconCollapse}
          onClick={onToggleOpened}
          isNavCollapsed={!opened}
          className={cx({
            [navButtonStyles.collapsed]: !opened,
          })}
        />
      </div>
    </div>
  );
}

export default ProjectNavigation;
