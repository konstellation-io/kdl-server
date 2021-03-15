import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CircularProgress from '@material-ui/core/CircularProgress';
import NavigationButton from '../NavigationButton/NavigationButton';
import { RouteProjectParams } from 'Constants/routes';
import cx from 'classnames';
import styles from './NavElements.module.scss';
import useProjectNavigation from 'Hooks/useProjectNavigation';
import useTool from 'Graphql/hooks/useTool';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import { NavButtonLink } from '../../ProjectNavigation';
import AnimateHeight from 'react-animate-height';
import { Button } from 'kwc';
import IconRemove from '@material-ui/icons/Delete';
import ConfirmAction from '../../../../../../Components/Layout/ConfirmAction/ConfirmAction';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

type Props = {
  isOpened: boolean;
};

function NavElements({ isOpened }: Props) {
  const { projectId } = useParams<RouteProjectParams>();
  const {
    projectRoutes,
    userToolsRoutes,
    projectToolsRoutes,
  } = useProjectNavigation(projectId);
  const { updateProjectActiveTools, projectActiveTools } = useTool();
  const { data } = useQuery<GetMe>(GetMeQuery);
  const areToolsActive = data?.me.areToolsActive;

  function toggleTools() {
    updateProjectActiveTools(!areToolsActive);
  }

  function renderToggleToolsIcon() {
    if (projectActiveTools.loading)
      return () => (
        <CircularProgress className={styles.loadingTools} size={16} />
      );
    return areToolsActive ? PauseIcon : PlayArrowIcon;
  }

  return (
    <>
      {projectRoutes.map(({ Icon, label, to }) => (
        <NavButtonLink to={to} key={label}>
          <NavigationButton label={label} Icon={Icon} />
        </NavButtonLink>
      ))}
      <div className={styles.projectTools}>
        {projectToolsRoutes.map(({ Icon, label, to }) => (
          <NavButtonLink to={to} key={label}>
            <NavigationButton label={label} Icon={Icon} />
          </NavButtonLink>
        ))}
        <div
          className={cx(styles.userTools, {
            [styles.show]: isOpened,
            [styles.started]: areToolsActive,
            [styles.stopped]: !areToolsActive,
          })}
        >
          <AnimateHeight height={isOpened ? 'auto' : 0} duration={300}>
            <div className={styles.userToolLabel}>USER TOOLS</div>
          </AnimateHeight>
          {userToolsRoutes.map(({ Icon, label, to, disabled }) => (
            <NavButtonLink to={to} key={label} disabled={disabled}>
              <NavigationButton label={label} Icon={Icon} />
            </NavButtonLink>
          ))}
          <div
            className={cx(styles.toggleToolsWrapper, {
              [styles.disabled]: projectActiveTools.loading,
            })}
            onClick={toggleTools}
          >
            {areToolsActive && (
              <ConfirmAction
                title="STOP YOUR TOOLS"
                action={toggleTools}
                actionLabel="STOP"
                warning
              >
                <NavigationButton
                  label="Stop tools"
                  Icon={renderToggleToolsIcon()}
                />
              </ConfirmAction>
            )}
            {!areToolsActive && (
              <NavigationButton
                label="Run tools"
                Icon={renderToggleToolsIcon()}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NavElements;
