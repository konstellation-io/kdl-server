import React, { FC } from 'react';
import styles from './Thumb.module.scss';

export interface ValueLabelProps {
  children?: React.ReactElement;
  value: number;
}

interface Props extends ValueLabelProps {
  max: number;
}

const Thumb: FC<Props> = ({ max, children, value }) => (
  <div className={styles.labelContainer}>
    <span className={styles.label} style={{ left: `${value - 5}%` }}>
      {max - value}%
    </span>
    {children}
  </div>
);

export default Thumb;
