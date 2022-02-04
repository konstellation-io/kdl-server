import React from 'react';
import styles from './RuntimeItem.module.scss';
import { GetRuntimes_runtimes } from '../../../../../Graphql/queries/types/GetRuntimes';
import RuntimeIcon, { RUNTIME_STATUS } from '../../../../Icons/RuntimeIcon/RuntimeIcon';

type Props = {
  runtime: GetRuntimes_runtimes;
};

function RuntimeItem({ runtime }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <RuntimeIcon status={RUNTIME_STATUS.NOT_SELECTED} className={'icon-regular'}></RuntimeIcon>
        <div className={styles.name}>{runtime.name}</div>
      </div>
      <div className={styles.labels}>
        {runtime.labels?.map((label: string) => (
          <div key={label} className={styles.label}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RuntimeItem;
