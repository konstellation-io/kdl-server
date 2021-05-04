import React, { useCallback, useMemo } from 'react';

import { KGFilters } from '../useKGFilters';
import ShowOthersFilter from './components/ShowOthersFilter/ShowOthersFilter';
import TopicFilter from './components/TopicFilter/TopicFilter';
import styles from './Filters.module.scss';

export interface Topic {
  name: string;
  nResources: number;
  relevance: number;
}

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
      <ShowOthersFilter
        showOthers={filters?.showOthers ?? false}
        onUpdate={handleShowOthersUpdate}
      />
      <TopicFilter topics={filterableTopics} onUpdate={handleTopicsUpdate} />
    </div>
  );
}

export default Filters;
