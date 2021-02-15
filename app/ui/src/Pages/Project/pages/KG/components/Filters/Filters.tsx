import React, { useState } from 'react';
import styles from './Filters.module.scss';
import ScoreFilter from './components/ScoreFilter/ScoreFilter';

const MAX_SCORE = 100;

type Props = {};
function Filters({}: Props) {
  const [scores, setScores] = useState<[number, number]>([20, 80]);

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setScores(numbers as [number, number]);

  return (
    <div className={styles.container}>
      <ScoreFilter
        scores={scores}
        onChange={handleSliderChange}
        max={MAX_SCORE}
      />
      <div className={styles.topic}>TOPIC</div>
    </div>
  );
}

export default Filters;
