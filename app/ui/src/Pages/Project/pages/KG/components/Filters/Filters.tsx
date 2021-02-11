import React, { useState } from 'react';

import ScoreFilter from './components/ScoreFilter/ScoreFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';

function Filters() {
  const [scores, setScores] = useState<[number, number]>([20, 80]);

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setScores(numbers as [number, number]);

  return (
    <div className={styles.container}>
      <ScoreFilter scores={scores} onChange={handleSliderChange} />
      <div className={styles.topic}>
        <TopicFilter
          topics={[
            { id: '1', name: 'name', papersTopicCount: 3 },
            { id: '2', name: 'name2', papersTopicCount: 4 },
          ]}
          selectedTopics={['1']}
        />
      </div>
    </div>
  );
}

export default Filters;
