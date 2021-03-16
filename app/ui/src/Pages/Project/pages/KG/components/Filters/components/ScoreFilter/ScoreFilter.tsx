import React, { FC, useCallback, useMemo } from 'react';
import Thumb, { ValueLabelProps } from './components/Thumb/Thumb';

import Slider from '@material-ui/core/Slider';
import cx from 'classnames';
import { kgScore } from 'Graphql/client/cache';
import styles from './ScoreFilter.module.scss';
import stylesThumb from './components/Thumb/Thumb.module.scss';
import useKGFilters from 'Graphql/client/hooks/useKGFilters';
import { useReactiveVar } from '@apollo/client';

export type Scores = [number, number];
type Props = {
  min?: number;
  max?: number;
};

const ScoreFilter: FC<Props> = ({ min = 0, max = 100 }) => {
  const { updateScore } = useKGFilters();
  const scores = useReactiveVar(kgScore);

  const formattedScores = useMemo(
    () => scores.map((s) => Math.round(Math.abs(100 - s * 100))),
    [scores]
  );

  const thumb = useCallback(
    (props: ValueLabelProps) => <Thumb {...props} max={max} />,
    [max]
  );
  const isOverlapping = formattedScores[1] - formattedScores[0] < 20;

  function onScoreUpdate(
    _: React.ChangeEvent<{}>,
    newScores: number | number[]
  ) {
    const scoresTyped = newScores as [number, number];
    updateScore(
      scoresTyped.map((s) => Math.abs(100 - s) / 100) as [number, number]
    );
  }

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
        onChange={onScoreUpdate}
        value={formattedScores}
        ValueLabelComponent={thumb}
      />
      <span className={cx(styles.percentageLabel, styles.maxLabel)}>
        {min}%
      </span>
    </div>
  );
};

export default ScoreFilter;
