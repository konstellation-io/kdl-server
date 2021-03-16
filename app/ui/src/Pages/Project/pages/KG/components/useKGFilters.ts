import { D, TopicSections } from './KGVisualization/KGVisualization';
import { useCallback, useMemo, useState } from 'react';

import { Scores } from './Filters/components/ScoreFilter/ScoreFilter';

export interface KGFilters {
  score?: Scores;
  topics?: string[];
  showOthers?: boolean;
}

function useKGFilters(sections: TopicSections, resources: D[]) {
  const [filters, setFilters] = useState<KGFilters>({
    score: [0, 1],
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
    const [bottomScore, topScore] = filters.score;
    return resources.filter(({ score, category }) => {
      const isInScoreRange = score <= topScore && score >= bottomScore;
      const isInCategory = filteredSections.includes(category);
      return isInScoreRange && isInCategory;
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
