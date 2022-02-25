import * as React from 'react';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import styles from './RuntimeInfo.module.scss';
import LabelList from '../RuntimesList/components/LabelList';
import { useReactiveVar } from '@apollo/client';
import { runningRuntime } from 'Graphql/client/cache';

type Props = {
  selectedRuntime: GetRuntimes_runtimes;
  isKubeconfigEnabled: boolean;
};

function RuntimeInfo({ selectedRuntime: runtime, isKubeconfigEnabled }: Props) {
  const activeRuntime = useReactiveVar(runningRuntime);
  const running = activeRuntime?.id === runtime.id;
  return (
    <div>
      <div className={styles.header}>
        <div data-testid="runtimeInfoPanel">
          <div className={styles.title}>
            <h1 className={styles.headerName}>{runtime.name}</h1>
            {running && (
              <div className={styles.runningTag} data-testid="statusTag">
                Running
              </div>
            )}
          </div>
          <div className={styles.runtimeTags}>
            <LabelList runtime={runtime} />
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.runtimeDescription}>{runtime.desc}</div>
        <div className={styles.dockerImage}>
          <h2>Docker image</h2>
          <p>
            {runtime.dockerImage}:{runtime.dockerTag}
          </p>
        </div>
        {running && isKubeconfigEnabled && (
          <div className={styles.dockerImage}>
            <h2>VSCode Runtime</h2>
            <div className={styles.runtimeHelp}>
              <p>
                You can use the kubernetes extension in VSCode to attach a terminal to the runtime. To do so, open the
                kubernetes extension and follow this steps:
                <ol>
                  <li>
                    Configure the kube config located in{' '}
                    <span className={styles.highlight}>/home/coder/.kube/config</span>
                  </li>
                  <li>In the kubernetes extension, navigate to &ldquo;Workloads &gt; Pods&ldquo;</li>
                  <li>
                    Locate the runtime pod named <span className={styles.highlight}>{runtime.runtimePod}</span>, and
                    right click on it &gt; &ldquo;Terminal&ldquo;
                  </li>
                  <li>
                    Then attach your terminal to the container named{' '}
                    <span className={styles.highlight}>user-tools-vscode-runtime</span>
                  </li>
                </ol>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RuntimeInfo;
