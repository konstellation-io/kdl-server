import React, { useMemo, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { D } from '../KGVisualization/KGVisualization';
import ResourcesList from './components/ResourcesList/ResourcesList';
import { orderBy } from 'lodash';
import { resourcesViz } from '../KGVisualization/KGViz';
import styles from './ResourceLists.module.scss';
import NoItems from './components/NoItems/NoItems';

type Props = {
  starredResources: D[];
  resources?: D[];
  onResourceClick: (d: D, left: number) => void;
  scores?: [number, number];
  idToFullResource: { [key: string]: any };
  showTopResources?: boolean;
};
function ResourceLists({
  starredResources,
  resources = [],
  onResourceClick,
  scores = [1, 0],
  idToFullResource,
  showTopResources = true,
}: Props) {
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
    resourcesViz?.highlightResource(name, true);
  }

  function onLeave() {
    resourcesViz?.highlightResource(null);
  }

  function onSelectResource(resource: D) {
    let left = 0;

    if (resourcesViz) {
      const target = resourcesViz.data.find((d) => d.id === resource.id);
      left = (target?.x || 0) + resourcesViz.center.x;
    }

    onResourceClick(resource, -left / 2);
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
          {showTopResources && (
            <Tab>{`LIST (${filteredAllTopics.length})`}</Tab>
          )}
          <Tab>{`STARRED (${starredResources.length})`}</Tab>
        </TabList>
        <div className={styles.tabContainer}>
          {showTopResources && (
            <TabPanel>
              <ResourcesList
                header={listHeader}
                resources={filteredAllTopics}
                filterText={listFilterText}
                onClick={onSelectResource}
                onEnter={onEnter}
                onLeave={onLeave}
                onChangeFilterText={setListFilterText}
                idToFullResource={idToFullResource}
                noItems={
                  <NoItems
                    title="No items in the KG!"
                    subTitle="Please, provide us a better description of your project."
                  />
                }
              />
            </TabPanel>
          )}
          <TabPanel>
            <ResourcesList
              resources={starredResources}
              filterText={listFilterText}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
              onChangeFilterText={setListFilterText}
              idToFullResource={idToFullResource}
              noItems={
                <NoItems
                  title="No starred items yet!"
                  subTitle="Once you favourite an item you'll see them here."
                />
              }
            />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ResourceLists;
