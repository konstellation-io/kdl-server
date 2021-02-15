import React, { useEffect, useRef, useState } from 'react';
import styles from './TopicFilter.module.scss';
import { Button, BUTTON_ALIGN } from 'kwc';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AnimateHeight from 'react-animate-height';
import TopicList, { TopicListProps } from './components/TopicList/TopicList';
import TopicListFilter, {
  TopicListFilterProps,
} from './components/TopicListFilter/TopicListFilter';

interface Props extends TopicListProps, TopicListFilterProps {
  onResetClick: () => void;
}

function TopicFilter({
  topics,
  selectedTopics,
  onSelectOption,
  onFilterChange,
  onResetClick,
}: Props) {
  const [opened, setOpened] = useState(false);
  function toggleFilter() {
    setOpened(!opened);
  }

  function getButtonLabel() {
    const topicsCounter = topics.length;
    return `${topicsCounter} TOPIC${topicsCounter !== 1 ? 'S' : ''}`;
  }

  return (
    <div className={styles.container}>
      <Button
        className={cx(styles.button, { [styles.opened]: opened })}
        label={getButtonLabel()}
        Icon={ExpandMoreIcon}
        iconSize={'icon-small'}
        align={BUTTON_ALIGN.RIGHT}
        onClick={toggleFilter}
      />
      <AnimateHeight
        height={opened ? 'auto' : 0}
        duration={300}
        className={styles.content}
      >
        <TopicListFilter onFilterChange={onFilterChange} />
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
      </AnimateHeight>
    </div>
  );
}

export default TopicFilter;
