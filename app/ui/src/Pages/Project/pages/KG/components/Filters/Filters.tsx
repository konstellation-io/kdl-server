import React, { useCallback, useMemo } from 'react';

import { KGFilters } from '../useKGFilters';
import ShowOthersFilter from './components/ShowOthersFilter/ShowOthersFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';
import { Button } from 'kwc';

export interface Topic {
  name: string;
  nResources: number;
  relevance: number;
}

type Props = {
  topics: Topic[];
  filters: KGFilters;
  onFiltersChange: (kgFilters: KGFilters) => void;
  restoreScores: () => void;
};
function Filters({ topics, filters, onFiltersChange, restoreScores }: Props) {
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
      <Button label="Restore zoom" onClick={restoreScores} />
      <ShowOthersFilter
        showOthers={filters?.showOthers ?? false}
        onUpdate={handleShowOthersUpdate}
      />
      <TopicFilter topics={filterableTopics} onUpdate={handleTopicsUpdate} />
    </div>
  );
}

export default Filters;
