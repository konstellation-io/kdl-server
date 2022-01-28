import * as React from 'react';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import styles from './RuntimeInfo.module.scss';
import LabelList from '../RuntimesList/components/LabelList';
import { useReactiveVar } from '@apollo/client';
import { runningRuntime } from 'Graphql/client/cache';

type Props = {
  selectedRuntime: GetRuntimes_runtimes;
  close: () => void;
};

function RuntimeInfo({ selectedRuntime: runtime, close }: Props) {
  const activeRuntime = useReactiveVar(runningRuntime);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div data-testid="runtimesListPanel">
          <h1 className={styles.headerName}>{runtime.name}</h1>
          <div className={styles.runtimeTags}>
            <LabelList runtime={runtime} running={activeRuntime?.id === runtime.id} />
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.runtimeDescription}>{runtime.desc}</div>
        <div className={styles.dockerImage}>
          <h2>Docker image</h2>
          <p>{runtime.DockerImage}</p>
        </div>
      </div>
    </div>
  );
}

export default RuntimeInfo;
