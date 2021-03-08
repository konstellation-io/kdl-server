import Filters, { Topic } from './components/Filters/Filters';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import KGVisualization, {
  TopicSections,
} from './components/KGVisualization/KGVisualization';
import React, { useMemo } from 'react';
import { buildKGItem, getSectionsAndNames } from './KGUtils';

import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import { ProjectRoute } from '../../ProjectPanels';
import data from './components/KGVisualization/data/data0.json';
import { loader } from 'graphql.macro';
import { orderBy } from 'lodash';
import styles from './KG.module.scss';
import useKGFilters from './components/useKGFilters';
import { useQuery } from '@apollo/client';

const selectedResource = 'Project Name 1';

const MAX_RESOURCES = 0;
const MAX_TOPICS = 10;

let resources = data.map((d: any) => ({
  category:
    Object.keys(JSON.parse(d.topics.replaceAll("'", '"')))[0] || 'Others',
  name: d.title,
  type: KnowledgeGraphItemCat.Paper,
  score: d.score,
}));

if (MAX_TOPICS) {
  const allTopics = resources.map((d) => d.category);
  const topTopics = allTopics.slice(0, MAX_TOPICS);

  resources = resources.map((d: any) => ({
    ...d,
    category: topTopics.includes(d.category) ? d.category : 'Others',
  }));
}

if (MAX_RESOURCES) {
  resources = orderBy(resources, ['score']).reverse().slice(0, MAX_RESOURCES);
}

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

function KG({ openedProject }: ProjectRoute) {
  // const { data } = useQuery<GetKnowledgeGraph, GetKnowledgeGraphVariables>(
  //   GetKnowledgeGraphQuery,
  //   {
  //     variables: { description: openedProject.description },
  //   }
  // );

  // TODO: Check this var when we have integration with the server
  // const resources = useMemo(() => {
  //   if (data?.knowledgeGraph) {
  //     return data.knowledgeGraph.items.map(buildKGItem);
  //   }
  //   return [];
  // }, [data]);

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
  } = useKGFilters(sections, resources);

  function onResourceSelection(name: string) {
    alert(`Resource selected: ${name}`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.kgTopBar}>
        <NavigationMenu />
        <Filters topics={topics} onFiltersChange={handleFiltersChange} />
      </div>
      <KGVisualization
        data={filteredResources}
        sections={filteredSections}
        selectedResource={selectedResource}
        onResourceSelection={onResourceSelection}
      />
    </div>
  );
}

export default KG;
