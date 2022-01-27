import React from 'react';
import styles from './Runtime.module.scss';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import cx from 'classnames';

type BaseProps = {
  runtime: GetRuntimes_runtimes;
};

type Props = {
  runtime: GetRuntimes_runtimes;
  runtimeActive: boolean;
};

function Runtime({ runtime, runtimeActive }: Props) {
  return (
    <div
      data-testid="runtime"
      className={cx(styles.container, {
        [styles.active]: runtimeActive,
      })}
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

function LabelList({ runtime }: BaseProps) {
  if (!runtime.labels) return <div></div>;

  return (
    <div className={styles.labels}>
      <div>
        {[
          ...runtime.labels.map((label) => (
            <div key={label} className={styles.label}>
              {label}
            </div>
          )),
        ]}
      </div>
    </div>
  );
}

export default Runtime;
