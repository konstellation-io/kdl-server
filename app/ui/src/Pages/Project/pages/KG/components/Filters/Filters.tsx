import React, { useCallback, useMemo } from 'react';
import ScoreFilter, { Scores } from './components/ScoreFilter/ScoreFilter';

import { KGFilters } from '../useKGFilters';
import ShowOthersFilter from './components/ShowOthersFilter/ShowOthersFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';

export interface Topic {
  name: string;
  nResources: number;
}

const MAX_SCORE = 100;

type Props = {
  topics: Topic[];
  showOthers: boolean;
  onFiltersChange: (kgFilters: KGFilters) => void;
};
function Filters({ topics, showOthers, onFiltersChange }: Props) {
  const handleScoreUpdate = useCallback(
    (score: Scores) => onFiltersChange({ score }),
    [onFiltersChange]
  );
  const handleTopicsUpdate = useCallback(
    (value: string[]) => onFiltersChange({ topics: value }),
    [onFiltersChange]
  );
  const handleShowOthersUpdate = useCallback(
    (value: boolean) => onFiltersChange({ showOthers: value }),
    [onFiltersChange]
  );

  const filterableTopics = useMemo(
    () => topics.filter((t) => t.name !== 'Others'),
    [topics]
  );

  return (
    <div className={styles.container}>
      <ScoreFilter onUpdate={handleScoreUpdate} max={MAX_SCORE} />
      <TopicFilter topics={filterableTopics} onUpdate={handleTopicsUpdate} />
      <ShowOthersFilter
        showOthers={showOthers}
        onUpdate={handleShowOthersUpdate}
      />
    </div>
  );
}

export default Filters;
