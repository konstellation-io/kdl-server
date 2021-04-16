import Filters, { Topic } from './components/Filters/Filters';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
  GetKnowledgeGraph_knowledgeGraph_items,
  GetKnowledgeGraph_knowledgeGraph_items_topics,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import KGVisualizationWrapper from './components/KGVisualization/KGVisualizationWrapper';
import React, { useMemo } from 'react';

import { ProjectRoute } from '../../ProjectPanels';
import { ErrorMessage, SpinnerCircular } from 'kwc';
import { getSectionsAndNames, TopicSections } from './KGUtils';
import { loader } from 'graphql.macro';
import styles from './KG.module.scss';
import useKGFilters from './components/useKGFilters';
import { useQuery } from '@apollo/client';

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

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
    () => data?.knowledgeGraph.topics.map((t) => t.name).slice(0, 9) || [],
    [data]
  );

  const kgItems: KGItem[] = useMemo(
    () =>
      data?.knowledgeGraph.items.map((r) => {
        const mainTopic = r.topics[0];
        const isInTop = topTopics.includes(mainTopic?.name);
        return {
          ...r,
          topic: isInTop
            ? mainTopic
            : { name: 'Others', relevance: 0, __typename: 'Topic' },
        };
      }) || [],
    [data, topTopics]
  );

  const [sections, topics]: [TopicSections, Topic[]] = useMemo(() => {
    const _sections = getSectionsAndNames(kgItems);
    const _topics: Topic[] = topTopics.map((topic) => ({
      name: topic,
      nResources: _sections[topic].length,
    }));
    return [_sections, _topics];
  }, [kgItems, topTopics]);

  const { handleFiltersChange, filteredResources, filters } = useKGFilters(
    sections,
    kgItems
  );

  if (loading) return <SpinnerCircular />;
  if (!data || error) return <ErrorMessage />;

  const filtersOrder = [...topTopics, 'Others'];
  const filtersOrderDict = Object.fromEntries(
    filtersOrder.map((f, idx) => [f, idx])
  );
  const sortFilters = (a: KGItem, b: KGItem) =>
    filtersOrderDict[a.topic?.name || ''] -
      filtersOrderDict[b.topic?.name || ''] ||
    (a.topic?.name || '').localeCompare(b.topic?.name || '');
  filteredResources.sort(sortFilters);

  return (
    <div className={styles.container}>
      <div className={styles.vizArea}>
        <div className={styles.kgTopBar}>
          <div className={styles.safeArea} />
          <Filters
            topics={topics}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
        <KGVisualizationWrapper data={filteredResources} />
      </div>
      <div className={styles.panelSafeArea} />
    </div>
  );
}

export default KG;
