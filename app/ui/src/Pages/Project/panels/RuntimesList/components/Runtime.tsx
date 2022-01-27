import React from 'react';
import cx from 'classnames';
import styles from './Runtime.module.scss';
import {GetRuntime_runtimes} from "Graphql/queries/types/GetRuntime";
import {AccessLevel} from "../../../../../Graphql/types/globalTypes";
import {run} from "apollo";

type Props = {
  runtime: GetRuntime_runtimes;
};

function Runtime({ runtime }: Props) {
  return (
    <div
      data-testid="runtime"
      className={cx(styles.container)}
    >
      <div className={styles.content}>
        <p className={styles.name} data-testid="runtimeName">
          {runtime.name}
        </p>
        <p className={styles.desc} data-testid="runtimeDesc">
          {runtime.desc}
        </p>
        <LabelList runtime={runtime}/>
      </div>
    </div>
  );
}

function LabelList({ runtime }: Props) {

  if (!runtime.labels ) return (<div></div>);

  return (
    <div className={styles.labels}>
      <div className={styles.content}>
        {[
          ...runtime.labels.map((label) => (
            <div key={label} className={styles.label}>{label}</div>
          )),
        ]}
      </div>
    </div>
  );
}

export default Runtime;
