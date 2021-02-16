import React, { useMemo, useState } from 'react';

import Filters, { Topic } from './components/Filters/Filters';
import KGVisualization, {
  TopicSections,
} from './components/KGVisualization/KGVisualization';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import staticData from './components/KGVisualization/data';
import styles from './KG.module.scss';
import { getSectionsAndNames } from './KGUtils';
import useKGFilters, { KGFilters } from './components/useKGFilters';

function KG() {
  // TODO: Change the following with the GraphQL query
  const [resources, setResources] = useState(staticData);

  const [sections, topics]: [TopicSections, Topic[]] = useMemo(() => {
    const sections = getSectionsAndNames(resources);
    const topics = Object.keys(sections).map((sectionName) => ({
      name: sectionName,
      papersTopicCount: sections[sectionName].length,
    }));
    return [sections, topics];
  }, [resources]);
  const [selectedResource, setSelectedResource] = useState('Project Name 1');
  const { setFilters, filteredResources, filteredSections } = useKGFilters(
    sections,
    resources
  );

  function onResourceSelection(name: string) {
    alert(`Resource selected: ${name}`);
  }

  function handleFiltersChange(newFilters: KGFilters) {
    setFilters(newFilters);
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
