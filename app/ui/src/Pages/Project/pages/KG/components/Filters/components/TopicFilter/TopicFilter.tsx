import { BUTTON_ALIGN, Button, TextInput, ExpandableMenu } from 'kwc';
import React from 'react';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import { Topic } from '../../Filters';
import TopicList from './components/TopicList/TopicList';
import cx from 'classnames';
import styles from './TopicFilter.module.scss';
import useTopicFilter from './useTopicFilter';
import useBoolState from 'Hooks/useBoolState';

interface Props {
  topics: Topic[];
  onUpdate: (topicsName: string[]) => void;
}

function TopicFilter({ topics, onUpdate }: Props) {
  const {
    value: opened,
    toggle: toggleFilter,
    deactivate: closeFilter,
  } = useBoolState(false);

  const {
    resetTopics,
    handleSelectTopic,
    filteredTopics,
    filterTopics,
    clearAll,
    selectedTopics,
  } = useTopicFilter(topics, onUpdate);

  function getButtonLabel() {
    const selectedTopicsCount = topics.filter((t) =>
      selectedTopics.includes(t.name)
    ).length;
    return `Top ${selectedTopicsCount} ${
      selectedTopicsCount === 1 ? 'topic' : 'topics'
    }`;
  }

  return (
    <div className={styles.container}>
      <Button
        className={cx(styles.button, { [styles.opened]: opened })}
        label={getButtonLabel()}
        Icon={ExpandMoreIcon}
        iconSize={'icon-small'}
        align={BUTTON_ALIGN.LEFT}
        onClick={toggleFilter}
      />
      <ExpandableMenu
        opened={opened}
        close={closeFilter}
        className={styles.content}
      >
        <div className={styles.contentWrapper}>
          <div className={styles.searchListContainer}>
            <TextInput
              placeholder="Find a topic"
              onChange={filterTopics}
              Icon={SearchIcon}
              showClearButton
              hideBottomText
              hideLabel
            />
            <TopicList
              topics={filteredTopics}
              selectedTopics={selectedTopics}
              onSelectOption={handleSelectTopic}
            />
          </div>
          <Button label="Select all" onClick={resetTopics} />
          <Button label="Clear all" onClick={clearAll} />
        </div>
      </ExpandableMenu>
    </div>
  );
}

export default TopicFilter;
