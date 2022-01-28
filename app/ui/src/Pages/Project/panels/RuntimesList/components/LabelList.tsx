import styles from './LabelList.module.scss';
import React from 'react';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';

type Props = {
  runtime: GetRuntimes_runtimes;
  running?: boolean;
};
function LabelList({ runtime, running }: Props) {
  if (!runtime.labels) return <div></div>;

  return (
    <div className={styles.labels}>
      <div>
        {running && <div className={styles.runningTag}>Running</div>}
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

export default LabelList;
