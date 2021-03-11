import { D } from '../KGVisualization/KGVisualization';
import React, { useMemo, useState } from 'react';
import { resourcesViz } from '../KGVisualization/KGViz';
import styles from './ListPanel.module.scss';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import TabAll from './components/TabAll/TabAll';
import TabStarred from './components/TabStarred/TabStarred';

type Props = {
  resources: D[];
  scores: [number, number];
};
function ListPanel({ resources, scores }: Props) {
  const [listFilterText, setListFilterText] = useState('');

  const top25 = useMemo(() => resources.slice(0, 25), [resources]);

  const filteredAllTopics = useMemo(() => {
    return top25.filter((resource) =>
      resource.name.toLowerCase().includes(listFilterText.toLowerCase())
    );
  }, [top25, listFilterText]);

  function handleResourceClick(resource: D) {
    console.log('resource clicked', resource);
  }

  function onEnter(name: string) {
    resourcesViz?.highlightResource(name);
  }

  function onLeave() {
    resourcesViz?.highlightResource(null);
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
              onClick={handleResourceClick}
              onEnter={onEnter}
              onLeave={onLeave}
              onChangeFilterText={setListFilterText}
            />
          </TabPanel>
          <TabPanel>
            <TabStarred
              starredResources={top25}
              onClick={handleResourceClick}
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
