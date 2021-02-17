import React, { useEffect, useRef, useState } from 'react';
import styles from './TopicFilter.module.scss';
import { Button, BUTTON_ALIGN, TextInput, useClickOutside } from 'kwc';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AnimateHeight from 'react-animate-height';
import TopicList from './components/TopicList/TopicList';
import SearchIcon from '@material-ui/icons/Search';
import useTopicFilter from './useTopicFilter';
import { Topic } from '../../Filters';

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
    const selectedTopicsCount = selectedTopics.length;
    return `${selectedTopicsCount} TOPIC${
      selectedTopicsCount !== 1 ? 'S' : ''
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
          <Button
            label="RESET TO DEFAULT"
            align={BUTTON_ALIGN.LEFT}
            className={styles.resetButton}
            onClick={resetTopics}
          />
        </div>
      </AnimateHeight>
    </div>
  );
}

export default TopicFilter;
