import React, { useMemo } from 'react';

import Filters, { Topic } from './components/Filters/Filters';
import KGVisualization, {
  TopicSections,
} from './components/KGVisualization/KGVisualization';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import styles from './KG.module.scss';
import { getSectionsAndNames, mapItem } from './KGUtils';
import useKGFilters from './components/useKGFilters';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';

import { ProjectRoute } from '../../ProjectPanels';

const selectedResource = 'Project Name 1';

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

function KG({ openedProject }: ProjectRoute) {
  const { data } = useQuery<GetKnowledgeGraph, GetKnowledgeGraphVariables>(
    GetKnowledgeGraphQuery,
    {
      variables: { description: openedProject?.description || '' },
    }
  );

  const resources = useMemo(() => {
    if (data?.knowledgeGraph) {
      return data.knowledgeGraph.items.map(mapItem);
    }
    return [];
  }, [data]);

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
