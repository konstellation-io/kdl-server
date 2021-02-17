import Filters, { Topic } from './components/Filters/Filters';
import KGVisualization, {
  TopicSections,
} from './components/KGVisualization/KGVisualization';
import React, { useCallback, useMemo, useState } from 'react';
import useKGFilters, { KGFilters } from './components/useKGFilters';

import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import { getSectionsAndNames } from './KGUtils';
import staticData from './components/KGVisualization/data';
import styles from './KG.module.scss';

function KG() {
  // TODO: Change the following with the GraphQL query
  const [resources] = useState(staticData);

  const [sections, topics]: [TopicSections, Topic[]] = useMemo(() => {
    const sections = getSectionsAndNames(resources);
    const topics = Object.keys(sections).map((sectionName) => ({
      name: sectionName,
      papersTopicCount: sections[sectionName].length,
    }));
    return [sections, topics];
  }, [resources]);
  const [selectedResource] = useState('Project Name 1');
  const { setFilters, filteredResources, filteredSections } = useKGFilters(
    sections,
    resources
  );

  function onResourceSelection(name: string) {
    alert(`Resource selected: ${name}`);
  }

  const handleFiltersChange = useCallback((newFilters: KGFilters) => setFilters(newFilters), [setFilters]);

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
