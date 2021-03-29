import IconSearch from '@material-ui/icons/Search';
import KGItem from '../KGItem/KGItem';
import { KGItem as KGItemType } from 'Pages/Project/pages/KG/KG';
import React from 'react';
import { TextInput } from 'kwc';
import styles from './ResourcesList.module.scss';

type Props = {
  onClick: (resource: KGItemType) => void;
  onEnter: (name: string) => void;
  onLeave: () => void;
  onChangeFilterText: (filter: string) => void;
  filterText: string;
  resources: KGItemType[];
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
      <div className={styles.top}>
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
      </div>
      <div className={styles.listWrapper}>
        {resources.map((r) => (
          <KGItem
            key={r.id}
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
