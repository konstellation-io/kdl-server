import React, { useEffect } from 'react';

import { KGFilters } from '../useKGFilters';
import ScoreFilter from './components/ScoreFilter/ScoreFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';
import useScoreFilter from './components/ScoreFilter/useScoreFilter';
import useTopicFilter from './components/TopicFilter/useTopicFilter';

export interface Topic {
  name: string;
  papersTopicCount: number;
}

const MAX_SCORE = 100;

type Props = {
  topics: Topic[];
  onFiltersChange: (KGFilters: KGFilters) => void;
};
function Filters({ topics, onFiltersChange }: Props) {
  const {
    resetTopics,
    handleSelectTopic,
    filteredTopics,
    filterTopics,
    selectedTopics,
  } = useTopicFilter(topics);

  const {
    scores,
    bottomScore,
    topScore,
    handleSliderChange,
    handleSliderChangeCommitted,
  } = useScoreFilter({ max: MAX_SCORE });

  useEffect(() => {
    onFiltersChange({
      score: [bottomScore, topScore],
      topics: selectedTopics,
    });
  }, [bottomScore, topScore, selectedTopics, onFiltersChange]);

  return (
    <div className={styles.container}>
      <ScoreFilter
        scores={scores}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        max={MAX_SCORE}
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
