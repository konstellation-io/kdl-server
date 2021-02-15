import React, { useEffect } from 'react';

import ScoreFilter from './components/ScoreFilter/ScoreFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';
import useScoreFilter from './components/ScoreFilter/useScoreFilter';
import useTopicFilter from './components/TopicFilter/useTopicFilter';

export interface Topic {
  id: string;
  name: string;
  papersTopicCount: number;
}

const _topics = [
  {
    id: '1',
    name: 'International and Compliance',
    papersTopicCount: 3,
  },
  {
    id: '2',
    name: 'Macro Economics & Super inflation',
    papersTopicCount: 4,
  },
  {
    id: '3',
    name: 'Non-profit economics organizations',
    papersTopicCount: 10,
  },
];

function Filters() {
  const max = 100;

  // TODO: get topics from the source and pass them to the hook
  const {
    resetTopics,
    handleSelectTopic,
    filteredTopics,
    filterTopics,
    selectedTopics,
  } = useTopicFilter(_topics);

  const {
    setScores,
    scores,
    bottomScore,
    topScore,
    setEdgeScores,
  } = useScoreFilter({ max });

  useEffect(() => {
    console.log(
      'filter papers in the KG using: ',
      bottomScore,
      topScore,
      selectedTopics
    );
  }, [bottomScore, topScore, selectedTopics]);

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setScores(numbers as [number, number]);

  const handleSliderChangeCommitted = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setEdgeScores(numbers as [number, number]);

  return (
    <div className={styles.container}>
      <ScoreFilter
        scores={scores}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        max={max}
      />
      <div className={styles.topic}>
        <TopicFilter
          onFilterChange={filterTopics}
          onSelectOption={handleSelectTopic}
          onResetClick={resetTopics}
          topics={filteredTopics}
          selectedTopics={selectedTopics}
        />
      </div>
    </div>
  );
}

export default Filters;
