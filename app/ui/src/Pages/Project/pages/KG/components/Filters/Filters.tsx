import React, { useState } from 'react';
import styles from './Filters.module.scss';
import ScoreFilter from './components/ScoreFilter/ScoreFilter';

type Props = {};
function Filters({}: Props) {
  const [scores, setScores] = useState<number[]>([20, 80]);
  function handleSliderChange(
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) {
    const newScores = numbers as number[];
    setScores(newScores);
  }
  return (
    <div className={styles.container}>
      <ScoreFilter scores={scores} onChange={handleSliderChange} />
      <div className={styles.topic}>TOPIC</div>
    </div>
  );
}

export default Filters;
