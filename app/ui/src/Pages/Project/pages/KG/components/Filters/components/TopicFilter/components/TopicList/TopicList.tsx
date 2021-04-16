import React from 'react';
import styles from './TopicList.module.scss';
import { Check } from 'kwc';
import { Topic } from '../../../../Filters';
import { scaleLinear } from '@visx/scale';

const COLOR_SCALE_COLORS = ['#0C3448', '#E52E3D'];

export interface TopicListProps {
  topics: Topic[];
  selectedTopics: string[];
  onSelectOption: (topic: Topic) => void;
}
function TopicList({ topics, selectedTopics, onSelectOption }: TopicListProps) {
  const nPaperInTopics = topics.map((t) => t.nResources);
  const min = Math.min(...nPaperInTopics);
  const max = Math.max(...nPaperInTopics);

  const colorScale = scaleLinear({
    domain: [min, max],
    range: COLOR_SCALE_COLORS,
  });

  return (
    <>
      <div className={styles.titlesContainer}>
        <span className={styles.title}>TOPICS</span>
        <span className={styles.paperCount}>PAPERS</span>
        <span className={styles.relevance}>RELEVANCE</span>
      </div>
      <ul className={styles.listContainer}>
        {topics.map((topic) => {
          return (
            <li
              key={topic.name}
              className={styles.lineWrapper}
              onClick={() => onSelectOption(topic)}
            >
              <div className={styles.titleInfoWrapper}>
                <Check
                  className={styles.check}
                  checked={selectedTopics.includes(topic.name)}
                  onChange={() => onSelectOption(topic)}
                />
                <span className={styles.lineText}>{topic.name}</span>
              </div>
              <div className={styles.infoWrapper}>
                <span
                  className={styles.paperCount}
                  style={{
                    backgroundColor: colorScale(topic.nResources),
                  }}
                >
                  {topic.nResources}
                </span>
                <span className={styles.relevance}>{topic.relevance}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default TopicList;
