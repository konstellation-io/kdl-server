import Filters, { Topic } from './components/Filters/Filters';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraph_knowledgeGraph_items,
  GetKnowledgeGraph_knowledgeGraph_items_topics,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import KGVisualizationWrapper from './components/KGVisualization/KGVisualizationWrapper';
import React, { useMemo } from 'react';

import { ProjectRoute } from '../../ProjectPanels';
import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  getSectionsAndNames,
  topicOthers,
  TopicSections,
  getKGItemsAndScores,
} from './KGUtils';
import styles from './KG.module.scss';
import useKGFilters from './components/useKGFilters';
import { useQuery } from '@apollo/client';

import GetKnowledgeGraphQuery from 'Graphql/queries/getKnowledgeGraph';

export interface KGItem extends GetKnowledgeGraph_knowledgeGraph_items {
  topic?: GetKnowledgeGraph_knowledgeGraph_items_topics;
}

function KG({ openedProject }: ProjectRoute) {
  const { data, error, loading } = useQuery<
    GetKnowledgeGraph,
    GetKnowledgeGraphVariables
  >(GetKnowledgeGraphQuery, {
    variables: { projectId: openedProject.id },
  });

  const topTopics = useMemo(
    () => data?.knowledgeGraph.topics.slice(0, 9) || [],
    [data]
  );

  const [kgItems, scoreDomain] = useMemo(
    () => getKGItemsAndScores(data?.knowledgeGraph.items, topTopics),
    [data, topTopics]
  );

  const [sections, topics]: [TopicSections, Topic[]] = useMemo(() => {
    const _sections = getSectionsAndNames(kgItems);
    const _topics: Topic[] = topTopics.map((topic) => ({
      name: topic.name,
      relevance: Math.round(topic.relevance * 100) / 100,
      nResources: _sections[topic.name]?.length || 0,
    }));
    return [_sections, _topics];
  }, [kgItems, topTopics]);

  const { handleFiltersChange, filteredResources, filters, restoreScores } =
    useKGFilters(sections, kgItems, scoreDomain);

  if (loading)
    return (
      <div className={styles.centeredSpinner}>
        <SpinnerCircular />
      </div>
    );
  if (!data || error) return <ErrorMessage />;

  const filtersOrder = [...topTopics, topicOthers];
  const filtersOrderDict = Object.fromEntries(
    filtersOrder.map((f, idx) => [f.name, idx])
  );
  const sortResources = (a: KGItem, b: KGItem) =>
    filtersOrderDict[a.topic?.name || ''] -
      filtersOrderDict[b.topic?.name || ''] ||
    (a.topic?.name || '').localeCompare(b.topic?.name || '');
  filteredResources.sort(sortResources);

  return (
    <div className={styles.container}>
      <div className={styles.vizArea}>
        <div className={styles.kgTopBar}>
          <div className={styles.safeArea} />
          <Filters
            topics={topics}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            restoreScores={restoreScores}
          />
        </div>
        <KGVisualizationWrapper data={filteredResources} />
      </div>
      <div className={styles.panelSafeArea} />
    </div>
  );
}

export default KG;
