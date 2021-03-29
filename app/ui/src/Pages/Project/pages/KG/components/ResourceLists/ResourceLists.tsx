import React, { useMemo, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { KGItem } from '../../KG';
import ResourcesList from './components/ResourcesList/ResourcesList';
import { orderBy } from 'lodash';
import { resourcesViz } from '../KGVisualization/KGViz';
import styles from './ResourceLists.module.scss';

type Props = {
  starredResources: KGItem[];
  resources: KGItem[];
  onResourceClick: (id: string, name: string, left: number) => void;
  scores: [number, number];
};
function ResourceLists({
  starredResources,
  resources,
  onResourceClick,
  scores,
}: Props) {
  const [listFilterText, setListFilterText] = useState('');

  const top25 = useMemo(
    () => orderBy(resources, ['score'], ['desc']).slice(0, 25),
    [resources]
  );

  const filteredAllTopics = useMemo(() => {
    return top25.filter((resource) =>
      resource.title.toLowerCase().includes(listFilterText.toLowerCase())
    );
  }, [top25, listFilterText]);

  function onEnter(name: string) {
    resourcesViz?.highlightResource(name, true);
  }

  function onLeave() {
    resourcesViz?.highlightResource(null);
  }

  function onSelectResource(resource: KGItem) {
    let left = 0;

    if (resourcesViz) {
      const target = resourcesViz.data.find((d) => d.id === resource.id);
      left = (target?.x || 0) + resourcesViz.center.x;
    }

    onResourceClick(resource.id, resource.title, -left / 2);
  }

  function formatScore(score: number) {
    return `${Math.round(score * 100)}%`;
  }

  const [maxScore, minScore] = scores;

  const listHeader = (
    <div className={styles.title}>
      {`Top 25 of resources between ${formatScore(maxScore)} and ${formatScore(
        minScore
      )} of score`}
    </div>
  );

  return (
    <div className={styles.container}>
      <Tabs
        selectedTabClassName={styles.selectedTab}
        className={styles.tabSection}
      >
        <TabList>
          <Tab>{`LIST (${filteredAllTopics.length})`}</Tab>
          <Tab>{`STARRED (${starredResources.length})`}</Tab>
        </TabList>
        <div className={styles.tabContainer}>
          <TabPanel>
            <ResourcesList
              header={listHeader}
              resources={filteredAllTopics}
              filterText={listFilterText}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
              onChangeFilterText={setListFilterText}
            />
          </TabPanel>
          <TabPanel>
            <ResourcesList
              resources={starredResources}
              filterText={listFilterText}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
              onChangeFilterText={setListFilterText}
            />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ResourceLists;
