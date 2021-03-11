import React, { memo } from 'react';

import cx from 'classnames';
import styles from './KGVisualization.module.scss';

function getColorClass(value: number) {
  let className = '';

  switch (true) {
    case value < 0.75:
      className = styles.notSoBad;
      break;
    case value < 0.5:
      className = styles.notGood;
      break;
    case value < 0.25:
      className = styles.bad;
      break;
    default:
      className = styles.good;
  }

  return className;
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
