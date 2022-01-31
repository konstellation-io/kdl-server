import * as React from 'react';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import styles from './RuntimeInfo.module.scss';
import LabelList from '../RuntimesList/components/LabelList';
import { useReactiveVar } from '@apollo/client';
import { runningRuntime } from 'Graphql/client/cache';

type Props = {
  selectedRuntime: GetRuntimes_runtimes;
};

function RuntimeInfo({ selectedRuntime: runtime }: Props) {
  const activeRuntime = useReactiveVar(runningRuntime);
  const running = activeRuntime?.id === runtime.id;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div data-testid="runtimesListPanel">
          <h1 className={styles.headerName}>{runtime.name}</h1>
          <div className={styles.runtimeTags}>
            <LabelList runtime={runtime} running={running} />
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.runtimeDescription}>{runtime.desc}</div>
        <div className={styles.dockerImage}>
          <h2>Docker image</h2>
          <p>{runtime.dockerImage}</p>
        </div>
        {running && (
          <div className={styles.dockerImage}>
            <h2>Usertools pod</h2>
            <p>{runtime.usertoolsPod}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RuntimeInfo;
