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

const MAX_SCORE = 100;

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
    scores,
    bottomScore,
    topScore,
    handleSliderChange,
    handleSliderChangeCommitted,
  } = useScoreFilter({ max: MAX_SCORE });

  useEffect(() => {
    // TODO: filter papers using the score values and selected topics
  }, [bottomScore, topScore, selectedTopics]);

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
