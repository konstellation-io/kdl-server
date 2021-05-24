import { useCallback, useMemo, useState } from 'react';

import { KGItem, topicOthers } from '../KG';
import { TopicSections } from '../KGUtils';

export interface KGFilters {
  topics?: string[];
  showOthers?: boolean;
}

function useKGFilters(sections: TopicSections, resources: KGItem[]) {
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

  const filteredResources = useMemo<KGItem[]>(
    () =>
      resources.map((resource) => ({
        ...resource,
        topic: filteredSections.includes(resource.topic?.name || '')
          ? resource.topic
          : topicOthers,
      })),
    [filteredSections, resources]
  );

  return {
    filters,
    handleFiltersChange,
    filteredResources,
  };
}

export default useKGFilters;
