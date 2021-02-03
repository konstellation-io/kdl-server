import { NavLink, useParams } from 'react-router-dom';
import React, { FC, useState } from 'react';
import usePanel, { PanelType } from 'Pages/Home/apollo/hooks/usePanel';

import IconCollapse from '@material-ui/icons/KeyboardBackspace';
import IconSettings from '@material-ui/icons/Settings';
import NavigationButton from './NavigationButton';
import { PANEL_ID } from 'Pages/Home/apollo/models/Panel';
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
  const { serverId, projectId } = useParams<RouteProjectParams>();
  // FIXME: get the left navigation bar state from the local storage
  const [opened, setOpened] = useState(false);
  const { togglePanel } = usePanel(PanelType.PRIMARY, {
    id: PANEL_ID.SETTINGS,
    title: 'Settings',
    fixedWidth: true,
  });

  function onToggleOpened() {
    setOpened(!opened);
  }

  const projectRoutes = useProjectNavigation(serverId, projectId);

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
          <NavigationButton label="COLLAPSE" Icon={IconCollapse} />
        </div>
      </div>
    </div>
  );
}

export default ProjectNavigation;
