import React, { memo } from 'react';

import cx from 'classnames';
import styles from './Repository.module.scss';

export enum LOCATION {
  IN = 'in',
  OUT = 'out',
}
export enum SIZE {
  TINY = 'tiny',
  SMALL = 'small',
  MEDIUM = 'medium',
}

const sizePixels = {
  [SIZE.MEDIUM]: 110,
  [SIZE.SMALL]: 55,
  [SIZE.TINY]: 14,
};

type Props = {
  squareLocation: LOCATION;
  size?: SIZE;
  shouldAnimate?: boolean;
};
function RepositoryTypeComponent({
  squareLocation,
  size = SIZE.MEDIUM,
  shouldAnimate = true,
}: Props) {
  return (
    <div
      className={cx(styles.square, styles[squareLocation], styles[size], {
        [styles.notAnimate]: !shouldAnimate,
      })}
      style={{ height: sizePixels[size], width: sizePixels[size] }}
    >
      <div className={styles.s4} />
      <div className={styles.s3} />
      <div className={styles.s2} />
      <div className={styles.s1} />
    </div>
  );
}

export default memo(RepositoryTypeComponent);
