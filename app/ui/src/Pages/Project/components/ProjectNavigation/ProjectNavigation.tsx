import { NavLink, useParams } from 'react-router-dom';
import React, { FC, useEffect, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useWorkspace, { CONFIG } from 'Hooks/useWorkspace';

import IconCollapse from '@material-ui/icons/KeyboardBackspace';
import IconSettings from '@material-ui/icons/Settings';
import NavigationButton from './NavigationButton';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import styles from './ProjectNavigation.module.scss';
import useProjectNavigation from 'Hooks/useProjectNavigation';

const NavButtonLink: FC<any> = ({ children, ...props }) => (
  <NavLink {...props} activeClassName={styles.active} exact>
    {children}
  </NavLink>
);

function ProjectNavigation() {
  const { projectId } = useParams<RouteProjectParams>();
  const [ { navigationOpened }, saveConfiguration ] = useWorkspace(projectId);
  const [ opened, setOpened ] = useState(navigationOpened);

  const { togglePanel } = usePanel(PanelType.PRIMARY, {
    id: PANEL_ID.SETTINGS,
    title: 'Settings',
    fixedWidth: true,
  });

  function onToggleOpened() {
    setOpened(!opened);
  }

  // Update local storage
  useEffect(
    () => () => saveConfiguration(CONFIG.NAVIGATION_OPENED, !opened),
    [opened, saveConfiguration]
  );

  const projectRoutes = useProjectNavigation(projectId);

  return (
    <div className={cx(styles.container, { [styles.opened]: opened })}>
      <div className={styles.top}>
        {projectRoutes.map(({ Icon, label, to }) => (
          <NavButtonLink to={to} key={label}>
            <NavigationButton label={label} Icon={Icon} />
          </NavButtonLink>
        ))}
      </div>
      <div className={styles.bottom}>
        <div onClick={togglePanel}>
          <NavigationButton label="SETTINGS" Icon={IconSettings} />
        </div>
        <div
          className={cx({
            [styles.collapsed]: !opened,
          })}
          onClick={onToggleOpened}
        >
          <NavigationButton
            label="COLLAPSE"
            title={opened ? "COLLAPSE" : "EXPAND"}
            Icon={IconCollapse}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectNavigation;
