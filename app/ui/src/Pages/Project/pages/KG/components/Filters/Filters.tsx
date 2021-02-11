import React, { useState } from 'react';
import styles from './Filters.module.scss';
import ScoreFilter from './components/ScoreFilter/ScoreFilter';

type Props = {};
function Filters({}: Props) {
  const max = 100;
  const [scores, setScores] = useState<number[]>([20, 80]);
  const topScore = max - scores[0];
  const bottomScore = max - scores[1];

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setScores(numbers as number[]);

  return (
    <div className={styles.container}>
      <ScoreFilter scores={scores} onChange={handleSliderChange} max={max} />
      <div className={styles.topic}>TOPIC</div>
    </div>
  );
}

export default Filters;
