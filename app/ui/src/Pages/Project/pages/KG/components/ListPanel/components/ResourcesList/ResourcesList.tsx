import { D } from '../../../KGVisualization/KGVisualization';
import IconSearch from '@material-ui/icons/Search';
import KGItem from '../KGItem/KGItem';
import React from 'react';
import { TextInput } from 'kwc';
import styles from './ResourcesList.module.scss';

type Props = {
  onClick: (resource: D) => void;
  onEnter: (name: string) => void;
  onLeave: () => void;
  onChangeFilterText: (filter: string) => void;
  filterText: string;
  resources: D[];
  header?: JSX.Element | null;
};
function ResourcesList({
  header = null,
  resources,
  onClick,
  onEnter,
  onLeave,
  onChangeFilterText,
  filterText,
}: Props) {
  return (
    <div className={styles.list}>
      {header}
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

export default ResourcesList;
