import AnimateHeight from 'react-animate-height';
import CircularProgress from '@material-ui/core/CircularProgress';
import {NavButtonLink} from '../../ProjectNavigation';
import NavigationButton from '../NavigationButton/NavigationButton';
import IconPause from '@material-ui/icons/Pause';
import IconPlay from '@material-ui/icons/PlayArrow';
import IconSettings from '@material-ui/icons/Settings';
import * as React from 'react';
import {RouteProjectParams} from 'Constants/routes';
import cx from 'classnames';
import styles from './NavElements.module.scss';
import {useParams} from 'react-router-dom';
import useProjectNavigation from 'Hooks/useProjectNavigation';
import {useReactiveVar} from '@apollo/client';
import {lastRanRuntime, loadingRuntime, primaryPanel, runningRuntime} from 'Graphql/client/cache';
import usePanel, {PanelType} from 'Graphql/client/hooks/usePanel';
import {USERTOOLS_PANEL_OPTIONS} from 'Pages/Project/panelSettings';
import {PANEL_ID} from 'Graphql/client/models/Panel';
import RuntimeRunner, {RuntimeAction} from 'Components/RuntimeRunner/RuntimeRunner';
import Tooltip from 'Components/Tooltip/Tooltip';

type Props = {
  isOpened: boolean;
};

function NavElements({ isOpened }: Props) {
  const { projectId } = useParams<RouteProjectParams>();
  const { mainRoutes, userToolsRoutes, projectToolsRoutes } = useProjectNavigation(projectId);
  const runtimeLoading = useReactiveVar(loadingRuntime);
  const isLoading = runtimeLoading !== null;

  const runtimeRunning = useReactiveVar(runningRuntime);
  const panelData = useReactiveVar(primaryPanel);
  const runtimeLastRun = useReactiveVar(lastRanRuntime);

  const { openPanel: openRuntimesList, closePanel: closeRuntimesList } = usePanel(
    PanelType.PRIMARY,
    USERTOOLS_PANEL_OPTIONS,
  );

  const tooltipProps = {
    effect: 'solid',
    textColor: 'white',
    backgroundColor: '#888',
  };

  function toggleUsertoolsPanel() {
    const shouldOpen = !panelData || panelData.id !== PANEL_ID.RUNTIMES_LIST;

    if (shouldOpen) openRuntimesList();
    else closeRuntimesList();
  }

  function renderToggleToolsIcon() {
    const Progress = (
      <div className={styles.progressSpinnerContainer}>
        <CircularProgress color="inherit" className={styles.loadingTools} size={12} />{' '}
      </div>
    );
    if (isLoading) return Progress;

    return runtimeRunning ? (
      <Tooltip tooltipId="stop" spanText="Stop tools" tooltipProps={tooltipProps}>
        <RuntimeRunner action={RuntimeAction.Stop}>
          <IconPause className={cx(styles.usertoolsIcon, 'icon-small')} data-testid="stopTools" />
        </RuntimeRunner>
      </Tooltip>
    ) : (
      <Tooltip tooltipId="start" spanText="Start tools" tooltipProps={tooltipProps}>
        <RuntimeRunner action={RuntimeAction.Start} runtime={runtimeLastRun || undefined}>
          <IconPlay className={cx(styles.usertoolsIcon, 'icon-small')} data-testid="startTools" />
        </RuntimeRunner>
      </Tooltip>
    );
  }

  return (
    <>
      {mainRoutes.map(({ Icon, label, route }) => (
        <NavButtonLink to={route} key={label}>
          <NavigationButton label={label} Icon={Icon} isNavCollapsed={!isOpened} />
        </NavButtonLink>
      ))}
      <div className={styles.projectTools}>
        {projectToolsRoutes.map(({ Icon, label, route, disabled }) => (
          <NavButtonLink to={route} key={label} disabled={disabled}>
            <NavigationButton label={label} Icon={Icon} isNavCollapsed={!isOpened} />
          </NavButtonLink>
        ))}
        <div
          className={cx(styles.userTools, {
            [styles.started]: runtimeRunning,
            [styles.stopped]: !runtimeRunning,
            [styles.loading]: isLoading,
          })}
        >
          <div className={cx(styles.usertoolsOptions, { [styles.opened]: isOpened })}>
            <AnimateHeight height={isOpened ? 'auto' : 0} duration={300}>
              <div className={styles.userToolLabel}>USER TOOLS</div>
            </AnimateHeight>
            <div
              className={cx(styles.usertoolsSettings, { [styles.opened]: isOpened })}
              data-testid="usertoolsSettings"
            >
              <Tooltip tooltipId="settings" spanText="Show available runtimes" tooltipProps={tooltipProps}>
                <div data-tip data-for="settings" data-testid="openRuntimeSettings">
                  <IconSettings className={cx(styles.usertoolsIcon, 'icon-small')} onClick={toggleUsertoolsPanel} />
                </div>
              </Tooltip>
              {renderToggleToolsIcon()}
            </div>
          </div>
          {userToolsRoutes.map(({ Icon, label, route, disabled }) => (
            <NavButtonLink to={route} key={label} disabled={disabled}>
              <NavigationButton label={label} Icon={Icon} isNavCollapsed={!isOpened} />
            </NavButtonLink>
          ))}
          <div
            className={cx(styles.toggleToolsWrapper, {
              [styles.disabled]: isLoading,
            })}
            data-testid="confirmationModal"
          />
        </div>
      </div>
    </>
  );
}

export default NavElements;
