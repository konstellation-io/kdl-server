import Filters, { Topic } from './components/Filters/Filters';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import KGVisualization, {
  D,
  TopicSections,
} from './components/KGVisualization/KGVisualization';
import React, { useMemo } from 'react';

import { ProjectRoute } from '../../ProjectPanels';
import { SpinnerCircular } from 'kwc';
import { getSectionsAndNames } from './KGUtils';
import { loader } from 'graphql.macro';
import styles from './KG.module.scss';
import useKGFilters from './components/useKGFilters';
import { useQuery } from '@apollo/client';

const selectedResource = 'My project';

export const starredItems = [
  0,
  1,
  4,
  6,
  12,
  34,
  35,
  65,
  120,
  144,
  365,
  456,
  754,
  942,
];

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

function KG({ openedProject }: ProjectRoute) {
  const { data, loading } = useQuery<
    GetKnowledgeGraph,
    GetKnowledgeGraphVariables
  >(GetKnowledgeGraphQuery, {
    variables: { description: openedProject.description },
  });

  const topTopics = useMemo(
    () => data?.knowledgeGraph.topics.map((t) => t.name).slice(0, 9) || [],
    [data]
  );

  // TODO: Check this var when we have integration with the server
  const resources: D[] = useMemo(() => {
    if (data?.knowledgeGraph) {
      return data.knowledgeGraph.items.map((item, idx: number) => ({
        id: item.id,
        category: topTopics.includes(item.topics[0]?.name || '')
          ? item.topics[0]?.name || ''
          : 'Others',
        type: item.category,
        name: item.title,
        score: item.score,
        starred: starredItems.includes(idx),
      }));
    }
    return [];
  }, [data]);

  const idToFullResource: { [key: string]: any } = useMemo(() => {
    if (data?.knowledgeGraph.items) {
      return Object.fromEntries(
        data.knowledgeGraph.items.map((r) => [
          r.id,
          {
            title: r.title,
            abstract: r.abstract,
            topics: r.topics,
            date: r.date,
            authors: r.authors,
            score: r.score,
            url: r.url,
          },
        ])
      );
    }
    return {};
  }, [data?.knowledgeGraph.items]);

  const [sections, topics]: [TopicSections, Topic[]] = useMemo(() => {
    const sections = getSectionsAndNames(resources);
    const topics = Object.keys(sections).map((sectionName) => ({
      name: sectionName,
      nResources: sections[sectionName].length,
    }));
    return [sections, topics];
  }, [resources]);

  const {
    handleFiltersChange,
    filteredResources,
    filteredSections,
    filters,
  } = useKGFilters(sections, resources);

  if (data === undefined) return null;
  if (loading) return <SpinnerCircular />;

  const filtersOrder = [...topTopics, 'Others'];
  const filtersOrderDict = Object.fromEntries(
    filtersOrder.map((f, idx) => [f, idx])
  );
  const sortFilters = (a: D, b: D) =>
    filtersOrderDict[a.category] - filtersOrderDict[b.category] ||
    a.category.localeCompare(b.category);
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
        <KGVisualization
          data={filteredResources}
          sections={filteredSections}
          selectedResource={selectedResource}
          idToFullResource={idToFullResource}
        />
      </div>
      <div className={styles.panelSafeArea} />
    </div>
  );
}

export default KG;
