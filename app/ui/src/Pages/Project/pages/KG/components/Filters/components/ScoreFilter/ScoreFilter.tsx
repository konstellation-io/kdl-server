import React, { FC } from 'react';
import styles from './ScoreFilter.module.scss';
import Slider from '@material-ui/core/Slider';
import cx from 'classnames';
import Thumb, { ValueLabelProps } from './components/Thumb/Thumb';
import useScoreFilter from './useScoreFilter';

export type Scores = [number, number];
type Props = {
  min?: number;
  max?: number;
  onUpdate: (scores: Scores) => void;
};

const ScoreFilter: FC<Props> = ({ onUpdate, min = 0, max = 100 }) => {
  const {
    scores,
    handleSliderChange,
    handleSliderChangeCommitted,
  } = useScoreFilter({ max, onUpdate });

  return (
    <div className={styles.container}>
      <span className={styles.leftLabel}>SCORE</span>
      <span className={cx(styles.percentageLabel, styles.minLabel)}>
        {max}%
      </span>
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
        onChangeCommitted={handleSliderChangeCommitted}
        onChange={handleSliderChange}
        value={scores}
        ValueLabelComponent={(props: ValueLabelProps) => (
          <Thumb {...props} max={max} />
        )}
      />
      <span className={cx(styles.percentageLabel, styles.maxLabel)}>
        {min}%
      </span>
    </div>
  );
};

export default ScoreFilter;
