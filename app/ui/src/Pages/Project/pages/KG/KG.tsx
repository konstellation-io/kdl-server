import Filters, { Topic } from './components/Filters/Filters';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraph_knowledgeGraph_items,
  GetKnowledgeGraph_knowledgeGraph_items_topics,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import KGVisualizationWrapper from './components/KGVisualization/KGVisualizationWrapper';
import React, { useMemo, useEffect } from 'react';

import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  getSectionsAndNames,
  topicOthers,
  TopicSections,
  getKGItemsAndScores,
} from './KGUtils';
import styles from './KG.module.scss';
import useKGFilters from './components/useKGFilters';
import { useQuery, useReactiveVar } from '@apollo/client';

import GetKnowledgeGraphQuery from 'Graphql/queries/getKnowledgeGraph';
import { useParams } from 'react-router';
import { RouteProjectParams } from 'Constants/routes';
import { openedProject } from 'Graphql/client/cache';
import KGRefreshing from './components/KGRefreshing/KGRefreshing';
import { isEmpty } from 'lodash';

export interface KGItem extends GetKnowledgeGraph_knowledgeGraph_items {
  topic?: GetKnowledgeGraph_knowledgeGraph_items_topics;
}

const KGSpinner = () => (
  <div className={styles.centeredSpinner}>
    <SpinnerCircular />
  </div>
);

function KG() {
  const { projectId } = useParams<RouteProjectParams>();
  const openedProjectData = useReactiveVar(openedProject);

  const { data, error, loading, refetch } = useQuery<
    GetKnowledgeGraph,
    GetKnowledgeGraphVariables
  >(GetKnowledgeGraphQuery, {
    variables: { projectId },
    // We do not want to fully cache this query as it data depends on project description, not project id
    fetchPolicy: 'cache-and-network',
    // This will update loading and data states when refetching
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    refetch();
    // We do not care about the refetch function as it cannot change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedProjectData?.description]);

  const topTopics = useMemo(
    () => data?.knowledgeGraph?.topics.slice(0, 9) || [],
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

  if (loading && isEmpty(data)) return <KGSpinner />;
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
      {loading && <KGRefreshing />}
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
