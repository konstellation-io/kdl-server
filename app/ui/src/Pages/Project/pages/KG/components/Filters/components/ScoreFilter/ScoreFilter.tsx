import React, { FC } from 'react';
import styles from './ScoreFilter.module.scss';
import Slider from '@material-ui/core/Slider';
import cx from 'classnames';
import Thumb, { ValueLabelProps } from './components/Thumb/Thumb';

type Props = {
  scores: number[];
  onChange: (_: React.ChangeEvent<{}>, values: number | number[]) => void;
  onChangeCommitted: (
    _: React.ChangeEvent<{}>,
    values: number | number[]
  ) => void;
  min?: number;
  max?: number;
};

const ScoreFilter: FC<Props> = ({
  scores,
  onChange,
  onChangeCommitted,
  min = 0,
  max = 100,
}) => (
  <div className={styles.container}>
    <span className={styles.leftLabel}>SCORE</span>
    <span className={cx(styles.percentageLabel, styles.minLabel)}>{max}%</span>
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
      onChangeCommitted={onChangeCommitted}
      onChange={onChange}
      value={scores}
      ValueLabelComponent={(props: ValueLabelProps) => (
        <Thumb {...props} max={max} />
      )}
    />
    <span className={cx(styles.percentageLabel, styles.maxLabel)}>{min}%</span>
  </div>
);

export default ScoreFilter;
