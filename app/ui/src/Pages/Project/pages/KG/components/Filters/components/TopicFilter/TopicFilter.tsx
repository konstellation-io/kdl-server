import React from 'react';
import styles from './TopicFilter.module.scss';
import { Select, SelectTheme } from 'kwc';

interface Topic {
  id: string;
  name: string;
  papersTopicCount: number;
}
type Props = {
  topics: Topic[];
  selectedTopics: string[];
};
function TopicFilter({ topics, selectedTopics }: Props) {
  function handleClick() {
    console.log('click');
  }

  return <div className={styles.container}></div>;
}

export default TopicFilter;
