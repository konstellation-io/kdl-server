import React, { FC, useCallback } from 'react';
import Thumb, { ValueLabelProps } from './components/Thumb/Thumb';

import Slider from '@material-ui/core/Slider';
import cx from 'classnames';
import styles from './ScoreFilter.module.scss';
import stylesThumb from './components/Thumb/Thumb.module.scss';
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

  const thumb = useCallback(
    (props: ValueLabelProps) => <Thumb {...props} max={max} />,
    [max]
  );
  const isOverlapping = scores[1] - scores[0] < 20;

  return (
    <div className={styles.container}>
      <span className={styles.leftLabel}>SCORE</span>
      <span className={cx(styles.percentageLabel, styles.minLabel)}>
        {max}%
      </span>
      <Slider
        className={cx(styles.slider, {
          [stylesThumb.overlapping]: isOverlapping,
        })}
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
        ValueLabelComponent={thumb}
      />
      <span className={cx(styles.percentageLabel, styles.maxLabel)}>
        {min}%
      </span>
    </div>
  );
};

export default ScoreFilter;
