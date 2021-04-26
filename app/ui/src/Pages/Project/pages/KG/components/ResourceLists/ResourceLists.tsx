import React, { useMemo } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { KGItem } from '../../KG';
import ResourcesList from './components/ResourcesList/ResourcesList';
import { orderBy } from 'lodash';
import styles from './ResourceLists.module.scss';

const NO_ITEMS_MESSAGE = {
  title: 'No items in the KG!',
  subTitle: 'Please, provide us a better description of your project.',
};
const NO_STARRED_ITEMS_MESSAGE = {
  title: 'No starred items yet!',
  subTitle:
    "Once you favourite an item you'll see them here. Go to the KG to choose your favorites.",
};

type Props = {
  starredResources: KGItem[];
  resources: KGItem[];
  onResourceClick: (id: string, name: string) => void;
  scores: [number, number];
  hoverResource?:
    | ((resourceName: string | null, skipTooltipLink?: boolean) => void)
    | null;
};

function ResourceLists({
  starredResources,
  resources,
  onResourceClick,
  scores,
  hoverResource,
}: Props) {
  const top25 = useMemo(
    () => orderBy(resources, ['score'], ['desc']).slice(0, 25),
    [resources]
  );

  function onEnter(name: string) {
    hoverResource && hoverResource(name, true);
  }

  function onLeave() {
    hoverResource && hoverResource(null);
  }

  function onSelectResource(resource: KGItem) {
    onResourceClick(resource.id, resource.title);
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
          <Tab>{`LIST (${top25.length})`}</Tab>
          <Tab>{`STARRED (${starredResources.length})`}</Tab>
        </TabList>
        <div className={styles.tabContainer}>
          <TabPanel>
            <ResourcesList
              header={listHeader}
              resources={top25}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
              noItems={NO_ITEMS_MESSAGE}
            />
          </TabPanel>
          <TabPanel>
            <ResourcesList
              resources={starredResources}
              onClick={onSelectResource}
              onEnter={onEnter}
              onLeave={onLeave}
              noItems={NO_STARRED_ITEMS_MESSAGE}
            />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

export default ResourceLists;
