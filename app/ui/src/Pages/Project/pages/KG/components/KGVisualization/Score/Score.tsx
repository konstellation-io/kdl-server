import React, { memo } from 'react';

import cx from 'classnames';
import styles from './Score.module.scss';

function getColorClass(value: number) {
  switch (true) {
    case value < 0.2:
      return styles.bad;
    case value < 0.7:
      return styles.notGood;
    case value < 0.9:
      return styles.notSoBad;
    default:
      return styles.good;
  }
}

type Props = {
  value: number;
  inline?: boolean;
};

function Score({ value, inline = false }: Props) {
  const percValue = `${Math.round(value * 100)}%`;

  return (
    <div
      className={cx(styles.scoreContainer, getColorClass(value), {
        [styles.inline]: inline,
      })}
    >
      <div className={styles.value}>{percValue}</div>
      <div className={styles.bars}>
        <div className={styles.barBg} />
        <div className={styles.barValue} style={{ width: percValue }} />
      </div>
    </div>
  );
}

export default memo(Score);
