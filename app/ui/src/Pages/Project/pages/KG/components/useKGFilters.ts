import useKgScores from 'Graphql/hooks/useKgScores';
import { useCallback, useMemo, useState } from 'react';
import { KGItem } from '../KG';
import { topicOthers, TopicSections } from '../KGUtils';

export interface KGFilters {
  topics?: string[];
  showOthers?: boolean;
}

function useKGFilters(
  sections: TopicSections,
  resources: KGItem[],
  scoreDomain: [number, number]
) {
  const { updateScores } = useKgScores();

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

  const filteredResources = useMemo<KGItem[]>(() => {
    const isInSelectedTopics = (resource: KGItem) =>
      filteredSections.includes(resource.topic?.name || '');

    // If show others filter is not activated, it must remove others resources from the filtered resources.
    if (!filters.showOthers) {
      return resources.filter(isInSelectedTopics);
    }

    // Show others filter is activated so it will return all resources changing the resource topic to "other"
    // in case the resource topic is not in the selected topics.
    return resources.map((resource) => ({
      ...resource,
      topic: isInSelectedTopics(resource) ? resource.topic : topicOthers,
    }));
  }, [filteredSections, resources, filters.showOthers]);

  function restoreScores() {
    updateScores(scoreDomain);
  }

  return {
    filters,
    handleFiltersChange,
    filteredResources,
    restoreScores,
  };
}

export default useKGFilters;
