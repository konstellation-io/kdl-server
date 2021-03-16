import React from 'react';
import { D } from '../../../KGVisualization/KGVisualization';
import styles from './TabAll.module.scss';
import KGItem from '../KGItem/KGItem';
import IconSearch from '@material-ui/icons/Search';
import { TextInput } from 'kwc';

type Props = {
  onClick: (resource: D) => void;
  onEnter: (name: string) => void;
  onLeave: () => void;
  onChangeFilterText: (filter: string) => void;
  filterText: string;
  resources: D[];
};
function TabAll({
  resources,
  onClick,
  onEnter,
  onLeave,
  onChangeFilterText,
  filterText,
}: Props) {
  return (
    <div className={styles.list}>
      <TextInput
        formValue={filterText}
        onChange={(value: string) => onChangeFilterText(value)}
        Icon={IconSearch}
        placeholder={'Find a paper...'}
        showClearButton
        hideLabel
        hideBottomText
      />
      <div className={styles.listWrapper}>
        {resources.map((r) => (
          <KGItem
            onEnter={onEnter}
            onLeave={onLeave}
            onClick={onClick}
            resource={r}
          />
        ))}
      </div>
    </div>
  );
}

export default TabAll;
