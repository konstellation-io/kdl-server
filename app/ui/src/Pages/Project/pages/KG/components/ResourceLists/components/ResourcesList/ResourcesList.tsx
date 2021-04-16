import IconSearch from '@material-ui/icons/Search';
import KGItem from '../KGItem/KGItem';
import { KGItem as KGItemType } from 'Pages/Project/pages/KG/KG';
import React, { useState } from 'react';
import { TextInput } from 'kwc';
import styles from './ResourcesList.module.scss';
import NoItems, { NoItemsProps } from '../NoItems/NoItems';

type Props = {
  onClick: (resource: KGItemType) => void;
  onEnter?: (name: string) => void;
  onLeave?: () => void;
  resources: KGItemType[];
  header?: JSX.Element | null;
  noItems: NoItemsProps;
};
function ResourcesList({
  header = null,
  resources,
  onClick,
  onEnter,
  onLeave,
  noItems,
}: Props) {
  const [filterText, setFilterText] = useState('');

  function renderListContent() {
    const filteredResources = resources.filter((r) =>
      r.title.toLowerCase().includes(filterText.toLowerCase())
    );
    if (filteredResources.length === 0) return <NoItems {...noItems} />;

    return filteredResources.map((r) => (
      <KGItem
        key={r.id}
        onEnter={onEnter}
        onLeave={onLeave}
        onClick={onClick}
        resource={r}
      />
    ));
  }

  return (
    <div className={styles.list}>
      <div className={styles.top}>
        {header}
        <TextInput
          formValue={filterText}
          onChange={setFilterText}
          Icon={IconSearch}
          placeholder={'Find a paper...'}
          showClearButton
          hideLabel
          hideBottomText
        />
      </div>
      <div className={styles.listWrapper}>{renderListContent()}</div>
    </div>
  );
}

export default ResourcesList;
