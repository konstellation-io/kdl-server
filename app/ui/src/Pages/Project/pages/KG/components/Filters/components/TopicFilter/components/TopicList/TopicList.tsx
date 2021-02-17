import React from 'react';
import styles from './TopicList.module.scss';
import { Check } from 'kwc';
import { colorScale, getColorNumber } from '../../../../../../KGUtils';
import { Topic } from '../../../../Filters';

export interface TopicListProps {
  topics: Topic[];
  selectedTopics: string[];
  onSelectOption: (topic: Topic) => void;
}
function TopicList({ topics, selectedTopics, onSelectOption }: TopicListProps) {
  return (
    <ul className={styles.listContainer}>
      {topics.map((topic) => {
        return (
          <li
            key={topic.name}
            className={styles.lineWrapper}
            onClick={() => onSelectOption(topic)}
          >
            <Check
              checked={selectedTopics.includes(topic.name)}
              onChange={() => onSelectOption(topic)}
            />
            <span className={styles.lineText}>{topic.name}</span>
            <span
              className={styles.paperCount}
              style={{
                backgroundColor: colorScale(topic.nResources),
                color: getColorNumber(topic.nResources),
              }}
            >
              {topic.nResources}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default TopicList;
