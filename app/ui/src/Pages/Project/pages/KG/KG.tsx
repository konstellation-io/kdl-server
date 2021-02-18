import React, { useEffect, useMemo, useState } from 'react';

import Filters, { Topic } from './components/Filters/Filters';
import KGVisualization, {
  TopicSections,
} from './components/KGVisualization/KGVisualization';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import resources from './components/KGVisualization/data';
import styles from './KG.module.scss';
import { getSectionsAndNames } from './KGUtils';
import useKGFilters from './components/useKGFilters';
import { PreviewScore } from './components/Filters/components/ScoreFilter/useScoreFilter';

const selectedResource = 'Project Name 1';

function KG() {
  const [sections, topics]: [TopicSections, Topic[]] = useMemo(() => {
    const sections = getSectionsAndNames(resources);
    const topics = Object.keys(sections).map((sectionName) => ({
      name: sectionName,
      nResources: sections[sectionName].length,
    }));
    return [sections, topics];
  }, []);
  const [_, setPreviewScore] = useState<PreviewScore | null>(null);
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
        <Filters
          topics={topics}
          onFiltersChange={handleFiltersChange}
          onChange={setPreviewScore}
        />
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
