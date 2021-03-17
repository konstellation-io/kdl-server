import { BUTTON_ALIGN, Button, TextInput, useClickOutside } from 'kwc';
import React, { useEffect, useRef, useState } from 'react';

import AnimateHeight from 'react-animate-height';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import { Topic } from '../../Filters';
import TopicList from './components/TopicList/TopicList';
import cx from 'classnames';
import styles from './TopicFilter.module.scss';
import useTopicFilter from './useTopicFilter';

interface Props {
  topics: Topic[];
  onUpdate: (topicsName: string[]) => void;
}

function TopicFilter({ topics, onUpdate }: Props) {
  const contentRef = useRef(null);
  const [opened, setOpened] = useState(false);

  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: contentRef,
    action: () => setOpened(false),
  });

  const {
    resetTopics,
    handleSelectTopic,
    filteredTopics,
    filterTopics,
    clearAll,
    selectedTopics,
  } = useTopicFilter(topics, onUpdate);

  useEffect(() => {
    if (contentRef && opened) addClickOutsideEvents();
    else removeClickOutsideEvents();
    return () => removeClickOutsideEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentRef, opened]);

  function toggleFilter() {
    setOpened(!opened);
  }

  function getButtonLabel() {
    const selectedTopicsCount = topics.filter((t) =>
      selectedTopics.includes(t.name)
    ).length;
    return `TOP ${selectedTopicsCount} ${
      selectedTopicsCount === 1 ? 'TOPIC' : 'TOPICS'
    }`;
  }

  return (
    <div className={styles.container} ref={contentRef}>
      <Button
        className={cx(styles.button, { [styles.opened]: opened })}
        label={getButtonLabel()}
        Icon={ExpandMoreIcon}
        iconSize={'icon-small'}
        align={BUTTON_ALIGN.LEFT}
        onClick={toggleFilter}
      />
      <AnimateHeight
        height={opened ? 'auto' : 0}
        duration={300}
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
          <Button
            label="RESET TO DEFAULT"
            align={BUTTON_ALIGN.LEFT}
            onClick={resetTopics}
          />
          <Button
            label="CLEAR ALL"
            align={BUTTON_ALIGN.LEFT}
            onClick={clearAll}
          />
        </div>
      </AnimateHeight>
    </div>
  );
}

export default TopicFilter;
