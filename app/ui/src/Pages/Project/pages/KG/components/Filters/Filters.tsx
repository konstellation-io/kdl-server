import React, { useCallback, useMemo } from 'react';

import { KGFilters } from '../useKGFilters';
import ScoreFilter from './components/ScoreFilter/ScoreFilter';
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
  filters: KGFilters;
  onFiltersChange: (kgFilters: KGFilters) => void;
};
function Filters({ topics, filters, onFiltersChange }: Props) {
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
      <ScoreFilter max={MAX_SCORE} />
      <TopicFilter topics={filterableTopics} onUpdate={handleTopicsUpdate} />
      <ShowOthersFilter
        showOthers={filters?.showOthers ?? false}
        onUpdate={handleShowOthersUpdate}
      />
    </div>
  );
}

export default Filters;
