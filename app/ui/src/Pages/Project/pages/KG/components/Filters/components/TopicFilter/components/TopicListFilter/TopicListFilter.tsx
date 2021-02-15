import React, { FC } from 'react';
import styles from './TopicListFilter.module.scss';
import { TextInput } from 'kwc';
import SearchIcon from '@material-ui/icons/Search';

export interface TopicListFilterProps {
  onFilterChange: (text: string) => void;
}

const TopicListFilter: FC<TopicListFilterProps> = ({ onFilterChange }) => (
  <TextInput
    customClassname={styles.filterInput}
    placeholder="Find a topic"
    onChange={onFilterChange}
    Icon={SearchIcon}
    showClearButton
    lockHorizontalGrowth
  />
);

export default TopicListFilter;
