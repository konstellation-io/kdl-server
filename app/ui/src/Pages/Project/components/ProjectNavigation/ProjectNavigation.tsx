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

function ProjectNavigation() {
  const { projectId } = useParams<RouteProjectParams>();
  const [{ navigationOpened }, saveConfiguration] = useWorkspace(projectId);
  const [opened, setOpened] = useState(navigationOpened);

  const { togglePanel } = usePanel(PanelType.PRIMARY, {
    id: PANEL_ID.SETTINGS,
    title: 'Settings',
    fixedWidth: true,
  });

  function onToggleOpened() {
    setOpened(!opened);
    saveConfiguration(CONFIG.NAVIGATION_OPENED, !opened);
  }

  return (
    <div className={cx(styles.container, { [styles.opened]: opened })}>
      <div className={styles.top}>
        <NavElements isOpened={opened} />
      </div>
      <div className={styles.bottom}>
        <div onClick={togglePanel}>
          <NavigationButton label="SETTINGS" Icon={IconSettings} />
        </div>
        <div
          className={cx({
            [navButtonStyles.collapsed]: !opened,
          })}
          onClick={onToggleOpened}
        >
          <NavigationButton
            label="COLLAPSE"
            title={opened ? 'COLLAPSE' : 'EXPAND'}
            Icon={IconCollapse}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectNavigation;
