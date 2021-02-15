import React, { useEffect, useState } from 'react';

import ScoreFilter from './components/ScoreFilter/ScoreFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';
import useDebounce from './useDebounce';
import useScoreFilter from './components/ScoreFilter/useScoreFilter';
import useTopicFilter from './components/TopicFilter/useTopicFilter';

export interface Topic {
  id: string;
  name: string;
  papersTopicCount: number;
}

type Props = {};
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

function Filters({}: Props) {
  const timer = 1000;
  const max = 100;
  const min = 0;

  // TODO: get topics from the source and pass them to the hook
  const {
    resetTopics,
    handleSelectTopic,
    filteredTopics,
    filterTopics,
    selectedTopics,
  } = useTopicFilter(_topics);

  const { setScores, bottomScore, topScore, scores } = useScoreFilter(min, max);

  const debounceTopScore = useDebounce(topScore, timer);
  const debounceBottomScore = useDebounce(bottomScore, timer);
  const debounceSelectedTopics = useDebounce(selectedTopics, timer);

  useEffect(() => {
    console.log(
      'do something with debounced values',
      debounceTopScore,
      debounceBottomScore,
      debounceSelectedTopics
    );
  }, [debounceTopScore, debounceBottomScore, debounceSelectedTopics]);

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setScores(numbers as [number, number]);

  return (
    <div className={styles.container}>
      <ScoreFilter scores={scores} onChange={handleSliderChange} />
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
