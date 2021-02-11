import React, { useState } from 'react';
import styles from './Filters.module.scss';
import ScoreFilter from './components/ScoreFilter/ScoreFilter';

type Props = {};
function Filters({}: Props) {
  const [values, setValues] = useState<number[]>([20, 80]);
  function handleSliderChange(
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) {
    const newValues = numbers as number[];
    setValues(newValues);
  }
  return (
    <div className={styles.container}>
      <ScoreFilter values={values} onChange={handleSliderChange} />
      <div className={styles.topic}>TOPIC</div>
    </div>
  );
}

export default Filters;
