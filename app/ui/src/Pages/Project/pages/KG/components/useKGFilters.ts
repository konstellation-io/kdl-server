import { D, TopicSections } from './KGVisualization/KGVisualization';
import { useCallback, useMemo, useState } from 'react';

export interface KGFilters {
  topics?: string[];
  showOthers?: boolean;
}

function useKGFilters(sections: TopicSections, resources: D[]) {
  const [filters, setFilters] = useState<KGFilters>({
    topics: Object.keys(sections),
    showOthers: true,
  });

  const handleFiltersChange = useCallback(
    (newFilters: KGFilters) => {
      setFilters((prevState) => ({ ...prevState, ...newFilters }));
    },
    [setFilters]
  );

  const filteredSections = useMemo(() => {
    const selectedTopics = [...(filters.topics || [])];
    if (filters.showOthers) selectedTopics.push('Others');

    return selectedTopics;
  }, [filters.topics, filters.showOthers]);

  const filteredResources = useMemo<D[]>(() => {
    return resources.filter(({ category }) => {
      const isInCategory = filteredSections.includes(category);
      return isInCategory;
    });
  }, [filters, resources]);

  return {
    filters,
    handleFiltersChange,
    filteredResources,
    filteredSections,
  };
}

export default useKGFilters;
