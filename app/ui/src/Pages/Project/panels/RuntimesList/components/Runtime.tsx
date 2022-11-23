import React from 'react';
import styles from './Runtime.module.scss';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import cx from 'classnames';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import { useReactiveVar } from '@apollo/client';
import { loadingRuntime, selectedCapabilities } from 'Graphql/client/cache';
import LabelList from './LabelList';
import useRuntimeInfo from 'Hooks/useRuntimeInfo';

type Props = {
  runtime: GetRuntimes_runtimes;
  isRunning?: boolean;
  disabled?: boolean;
};

function Runtime({ runtime, isRunning, disabled }: Props) {
  const runtimeLoading = useReactiveVar(loadingRuntime);
  const selectedCapability = useReactiveVar(selectedCapabilities);
  const [openedRuntimeInfo, setOpenedRuntimeInfo] = useRuntimeInfo();
  const { openPanel, togglePanel, closePanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.RUNTIME_INFO,
    title: 'Detail',
    size: PANEL_SIZE.BIG,
    theme: PANEL_THEME.DEFAULT,
    runtime,
  });

  if (selectedCapability === null) {
    closePanel();
  }

  function toggleRuntimePanel() {
    if (disabled) return;

    if (runtime.id !== openedRuntimeInfo) {
      setOpenedRuntimeInfo(runtime.id);
      openPanel();
      return;
    }
    setOpenedRuntimeInfo('');
    togglePanel();
  }

  return (
    <div
      data-testid="runtime"
      className={cx(styles.container, {
        [styles.active]: isRunning,
        [styles.loading]: runtimeLoading === runtime.id || (isRunning && runtimeLoading !== null),
        [styles.disabled]: disabled || selectedCapability === null,
      })}
      onClick={() => !disabled && selectedCapability !== null && toggleRuntimePanel()}
    >
      <div className={styles.content}>
        <p className={styles.name} data-testid="runtimeName">
          {runtime.name}
        </p>
        <LabelList runtime={runtime} />
      </div>
    </div>
  );
}

export default Runtime;
