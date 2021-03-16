import React, { useMemo, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { D } from '../KGVisualization/KGVisualization';
import TabAll from './components/TabAll/TabAll';
import TabStarred from './components/TabStarred/TabStarred';
import { orderBy } from 'lodash';
import { resourcesViz } from '../KGVisualization/KGViz';
import styles from './ListPanel.module.scss';

type Props = {
  resources: D[];
  onResourceClick: (d: D, left: number) => void;
  scores: [number, number];
};
function ListPanel({ resources, onResourceClick, scores }: Props) {
  const [listFilterText, setListFilterText] = useState('');

  const top25 = useMemo(
    () => orderBy(resources, ['score'], ['desc']).slice(0, 25),
    [resources]
  );

  const filteredAllTopics = useMemo(() => {
    return top25.filter((resource) =>
      resource.name.toLowerCase().includes(listFilterText.toLowerCase())
    );
  }, [top25, listFilterText]);

  function onEnter(name: string) {
    resourcesViz?.highlightResource(name);
  }

  function onLeave() {
    resourcesViz?.highlightResource(null);
  }

  function onSelectResource(resource: D) {
    if (resourcesViz) {
      const target = resourcesViz.data.find((d) => d.id === resource.id);
      const left = (target?.x || 0) + resourcesViz.center.x;

      onResourceClick(resource, -left / 2);
    }
  }

  function formatScore(score: number) {
    return `${Math.round(score * 100)}%`;
  }

  const [maxScore, minScore] = scores;

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Top 25 of resources between ${formatScore(
          maxScore
        )} and ${formatScore(minScore)} of score`}
      </div>
      <Tabs
        selectedTabClassName={styles.selectedTab}
        className={styles.tabSection}
      >
        <TabList>
          <Tab>LIST ({`${filteredAllTopics.length}`})</Tab>
          <Tab>STARRED ({`25`})</Tab>
        </TabList>
        <div className={styles.tabContainer}>
          <TabPanel>
            <TabAll
              resources={filteredAllTopics}
              filterText={listFilterText}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
              onChangeFilterText={setListFilterText}
            />
          </TabPanel>
          <TabPanel>
            <TabStarred
              starredResources={top25}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
            />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ListPanel;
