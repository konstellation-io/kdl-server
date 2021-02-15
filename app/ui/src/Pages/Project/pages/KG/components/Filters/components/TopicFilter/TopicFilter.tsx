import React, { useEffect, useRef, useState } from 'react';
import styles from './TopicFilter.module.scss';
import { Button, BUTTON_ALIGN, TextInput, useClickOutside } from 'kwc';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AnimateHeight from 'react-animate-height';
import TopicList, { TopicListProps } from './components/TopicList/TopicList';
import SearchIcon from '@material-ui/icons/Search';

interface Props extends TopicListProps {
  onResetClick: () => void;
  onFilterChange: (text: string) => void;
}

function TopicFilter({
  topics,
  selectedTopics,
  onSelectOption,
  onFilterChange,
  onResetClick,
}: Props) {
  const contentRef = useRef(null);
  const [opened, setOpened] = useState(false);

  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: contentRef,
    action: () => setOpened(false),
  });

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
            onChange={onFilterChange}
            Icon={SearchIcon}
            showClearButton
            hideBottomText
            hideLabel
          />
          <TopicList
            topics={topics}
            selectedTopics={selectedTopics}
            onSelectOption={onSelectOption}
          />
          <Button
            label="RESET TO DEFAULT"
            align={BUTTON_ALIGN.LEFT}
            className={styles.resetButton}
            onClick={onResetClick}
          />
        </div>
      </AnimateHeight>
    </div>
  );
}

export default TopicFilter;
