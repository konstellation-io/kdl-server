import AnimateHeight from 'react-animate-height';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { NavButtonLink } from '../../ProjectNavigation';
import NavigationButton from '../NavigationButton/NavigationButton';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import IconSettings from "@material-ui/icons/Settings";
import * as React from 'react';
import { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import styles from './NavElements.module.scss';
import { useParams } from 'react-router-dom';
import useProjectNavigation from 'Hooks/useProjectNavigation';
import {useQuery, useReactiveVar} from '@apollo/client';
import useTool from 'Graphql/hooks/useTool';
import ConfirmAction from 'Components/Layout/ConfirmAction/ConfirmAction';

import GetMeQuery from 'Graphql/queries/getMe';
import {Button} from "kwc";
import IconEdit from "@material-ui/icons/Edit";
import {PANEL_ID, USERTOOLS_PANEL_ID} from "../../../../../../Graphql/client/models/Panel";
import {primaryPanel, usertoolsPrimaryPanel} from "../../../../../../Graphql/client/cache";
import usePanel, {PanelType} from "../../../../../../Graphql/client/hooks/usePanel";
import {SETTINGS_PANEL_OPTIONS, USERTOOLS_PANEL_OPTIONS} from "../../../../panelSettings";

type Props = {
  isOpened: boolean;
};

function NavElements({ isOpened }: Props) {
  const { projectId } = useParams<RouteProjectParams>();
  const { mainRoutes, userToolsRoutes, projectToolsRoutes } = useProjectNavigation(projectId);
  const { updateProjectActiveTools, projectActiveTools } = useTool();
  const { data, loading } = useQuery<GetMe>(GetMeQuery);
  const areToolsActive = data?.me.areToolsActive;
  const panelData = useReactiveVar(usertoolsPrimaryPanel);

  if (loading) return null;

  function toggleTools() {
    updateProjectActiveTools(!areToolsActive);
  }

  function toggleUsertoolsPanel() {
    const shouldOpen = !panelData || panelData.id !== USERTOOLS_PANEL_ID.RUNTIMES_LIST;

    //if (shouldOpen) openSettings();
    //else closeSettings();
  }

  function renderToggleToolsIcon() {
    const Progress = () => <CircularProgress className={styles.loadingTools} size={16} />;
    if (projectActiveTools.loading) return Progress;
    return areToolsActive ? PauseIcon : PlayArrowIcon;
  }

  return (
    <>
      {mainRoutes.map(({ Icon, label, route }) => (
        <NavButtonLink to={route} key={label}>
          <NavigationButton label={label} Icon={Icon} />
        </NavButtonLink>
      ))}
      <div className={styles.projectTools}>
        {projectToolsRoutes.map(({ Icon, label, route, disabled }) => (
          <NavButtonLink to={route} key={label} disabled={disabled}>
            <NavigationButton label={label} Icon={Icon} />
          </NavButtonLink>
        ))}
        <div
          className={cx(styles.userTools, {
            [styles.started]: areToolsActive,
            [styles.stopped]: !areToolsActive,
          })}
        >
          <AnimateHeight height={isOpened ? 'auto' : 0} duration={300}>
            <div className={styles.userToolLabel}>USER TOOLS</div>
            <div className={styles.button} data-testid="usertoolsSettings">
              <Button label="" Icon={IconSettings} onClick={toggleUsertoolsPanel} />
            </div>
          </AnimateHeight>
          {userToolsRoutes.map(({ Icon, label, route, disabled }) => (
            <NavButtonLink to={route} key={label} disabled={disabled}>
              <NavigationButton label={label} Icon={Icon} />
            </NavButtonLink>
          ))}
          <div
            className={cx(styles.toggleToolsWrapper, {
              [styles.disabled]: projectActiveTools.loading,
            })}
            data-testid="confirmationModal"
          >
            <ConfirmAction
              title="STOP YOUR TOOLS"
              subtitle="You are going to stop your user tools, please confirm your choice."
              action={toggleTools}
              actionLabel="STOP"
              skipConfirmation={!areToolsActive}
              warning
            >
              <NavigationButton
                dataTestId={areToolsActive ? 'stopTools' : 'runTools'}
                label={areToolsActive ? 'Stop tools' : 'Run tools'}
                Icon={renderToggleToolsIcon()}
              />
            </ConfirmAction>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavElements;
