import { NavLink, useParams } from 'react-router-dom';
import React, { FC, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import useWorkspace, { CONFIG } from 'Hooks/useWorkspace';

import IconCollapse from '@material-ui/icons/KeyboardBackspace';
import IconSettings from '@material-ui/icons/Settings';
import CircularProgress from '@material-ui/core/CircularProgress';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import NavigationButton from './NavigationButton';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import styles from './ProjectNavigation.module.scss';
import useProjectNavigation from 'Hooks/useProjectNavigation';
import useTool from 'Graphql/hooks/useTool';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

const NavButtonLink: FC<any> = ({ children, ...props }) => {
  return (
    <NavLink
      {...props}
      activeClassName={styles.active}
      className={cx({ [styles.disabled]: props.disabled })}
      exact
    >
      {children}
    </NavLink>
  );
};

function ProjectNavigation() {
  const { projectId } = useParams<RouteProjectParams>();
  const [{ navigationOpened }, saveConfiguration] = useWorkspace(projectId);
  const { updateProjectActiveTools } = useTool();
  const { data, loading } = useQuery<GetMe>(GetMeQuery);
  const [opened, setOpened] = useState(navigationOpened);
  const areToolsActive = data?.me.areToolsActive;

  const { togglePanel } = usePanel(PanelType.PRIMARY, {
    id: PANEL_ID.SETTINGS,
    title: 'Settings',
    fixedWidth: true,
  });

  function onToggleOpened() {
    setOpened(!opened);
    saveConfiguration(CONFIG.NAVIGATION_OPENED, !opened);
  }

  const projectRoutes = useProjectNavigation(projectId);

  function toggleTools() {
    updateProjectActiveTools(!areToolsActive);
  }

  function renderToggleToolsIcon() {
    if (loading)
      return <CircularProgress className={styles.loadingTools} size={16} />;
    return PowerSettingsNewIcon;
  }

  return (
    <div className={cx(styles.container, { [styles.opened]: opened })}>
      <div className={styles.top}>
        {projectRoutes.map(({ Icon, label, to, disabled }) => (
          <NavButtonLink to={to} key={label} disabled={disabled}>
            <NavigationButton label={label} Icon={Icon} />
          </NavButtonLink>
        ))}
      </div>
      <div className={styles.bottom}>
        <div
          onClick={toggleTools}
          className={cx({ [styles.iconOn]: areToolsActive })}
        >
          <NavigationButton
            label={areToolsActive ? 'STOP' : 'START'}
            Icon={renderToggleToolsIcon()}
          />
        </div>
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
            title={opened ? 'COLLAPSE' : 'EXPAND'}
            Icon={IconCollapse}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectNavigation;
