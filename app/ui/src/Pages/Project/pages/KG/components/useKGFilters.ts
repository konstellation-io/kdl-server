import { D, TopicSections } from './KGVisualization/KGVisualization';
import { useCallback, useMemo, useState } from 'react';

import { Scores } from './Filters/components/ScoreFilter/ScoreFilter';

export interface KGFilters {
  score?: Scores;
  topics?: string[];
}

function useKGFilters(sections: TopicSections, resources: D[]) {
  const [filters, setFilters] = useState<KGFilters>({
    score: [0, 1],
    topics: Object.keys(sections),
  });

  const handleFiltersChange = useCallback(
    (newFilters: KGFilters) => {
      setFilters((prevState) => ({ ...prevState, ...newFilters }));
    },
    [setFilters]
  );

  const filteredResources = useMemo<D[]>(() => {
    const [bottomScore, topScore] = filters.score;
    const selectedTopics = filters.topics || [];
    return resources.filter(({ score, category }) => {
      const isInScoreRange = score <= topScore && score >= bottomScore;
      const isInCategory = selectedTopics.includes(category);
      return isInScoreRange && isInCategory;
    });
  }, [filters, resources]);

  const filteredSections = useMemo<TopicSections>(() => {
    const selectedTopics = filters.topics || [];
    const selectedSections = selectedTopics
      .map((selectedTopic) => [selectedTopic, sections[selectedTopic]])
      .filter((topic) => {
        return filteredResources.some(
          (resource) => resource.category === topic[0]
        );
      });
    return Object.fromEntries(selectedSections);
  }, [filteredResources, filters.topics, sections]);

  return {
    handleFiltersChange,
    filteredResources,
    filteredSections,
  };
}

export default useKGFilters;
