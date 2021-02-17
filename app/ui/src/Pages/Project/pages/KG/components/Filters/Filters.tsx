import React, { useCallback } from 'react';
import styles from './Filters.module.scss';
import ScoreFilter, { Scores } from './components/ScoreFilter/ScoreFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import { KGFilters } from '../useKGFilters';

export interface Topic {
  name: string;
  nResources: number;
}

const MAX_SCORE = 100;

type Props = {
  topics: Topic[];
  onFiltersChange: (kgFilters: KGFilters) => void;
};
function Filters({ topics, onFiltersChange }: Props) {
  const handleScoreUpdate = useCallback(
    (score: Scores) => onFiltersChange({ score }),
    [onFiltersChange]
  );
  const handleTopicsUpdate = useCallback(
    (topics: string[]) => onFiltersChange({ topics }),
    [onFiltersChange]
  );

  return (
    <div className={styles.container}>
      <ScoreFilter onUpdate={handleScoreUpdate} max={MAX_SCORE} />
      <div className={styles.topic}>
        <TopicFilter topics={topics} onUpdate={handleTopicsUpdate} />
      </div>
    </div>
  );
}

export default Filters;
