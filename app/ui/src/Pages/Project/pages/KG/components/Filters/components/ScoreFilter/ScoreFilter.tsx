import React, { FC } from 'react';
import styles from './ScoreFilter.module.scss';
import Slider from '@material-ui/core/Slider';
import cx from 'classnames';

type Props = {
  values: number[];
  onChange: (_: React.ChangeEvent<{}>, values: number | number[]) => void;
  min?: number;
  max?: number;
};
const ScoreFilter: FC<Props> = ({ values, onChange, min = 0, max = 100 }) => (
  <div className={styles.container}>
    <span className={styles.leftLabel}>SCORE</span>
    <span className={cx(styles.percentageLabel, styles.minLabel)}>{min}%</span>
    <Slider
      className={styles.slider}
      classes={{
        rail: styles.rail,
        track: styles.track,
        thumb: styles.thumb,
        focusVisible: styles.focusVisible,
        active: styles.active,
      }}
      min={min}
      max={max}
      onChange={onChange}
      value={values}
    />
    <span className={cx(styles.percentageLabel, styles.maxLabel)}>{max}%</span>
  </div>
);

export default ScoreFilter;
