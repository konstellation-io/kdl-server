import React from 'react';
import styles from './Runtime.module.scss';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import cx from 'classnames';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import useSelectedRuntime from 'Graphql/client/hooks/useSelectedRuntime';
import { useReactiveVar } from '@apollo/client';
import { loadingRuntime, selectedRuntime } from 'Graphql/client/cache';
import LabelList from './LabelList';

type Props = {
  runtime: GetRuntimes_runtimes;
  runtimeActive?: boolean;
};

function Runtime({ runtime, runtimeActive }: Props) {
  const { openPanel, togglePanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.RUNTIME_INFO,
    title: 'Detail',
    size: PANEL_SIZE.BIG,
    theme: PANEL_THEME.DEFAULT,
  });
  const { updateSelectedRuntime } = useSelectedRuntime();
  const actualRuntime = useReactiveVar(selectedRuntime);
  const runtimeLoading = useReactiveVar(loadingRuntime);

  function toggleRuntimePanel() {
    if (runtime.id !== actualRuntime?.id) {
      updateSelectedRuntime(runtime);
      openPanel();
      return;
    }
    togglePanel();
  }

  return (
    <div
      data-testid="runtime"
      className={cx(styles.container, {
        [styles.active]: runtimeActive,
        [styles.loading]: runtimeLoading === runtime.id || (runtimeActive && runtimeLoading !== ''),
      })}
      onClick={toggleRuntimePanel}
    >
      <div className={styles.content}>
        <p className={styles.name} data-testid="runtimeName">
          {runtime.name}
        </p>
        <p className={styles.desc} data-testid="runtimeDesc">
          {runtime.desc}
        </p>
        <LabelList runtime={runtime} />
      </div>
    </div>
  );
}

export default Runtime;
