import IconSearch from '@material-ui/icons/Search';
import KGItem from '../KGItem/KGItem';
import { KGItem as KGItemType } from 'Pages/Project/pages/KG/KG';
import React from 'react';
import { TextInput } from 'kwc';
import styles from './ResourcesList.module.scss';
import NoItems, { NoItemsProps } from '../NoItems/NoItems';

type Props = {
  onClick: (resource: KGItemType) => void;
  onEnter?: (name: string) => void;
  onLeave?: () => void;
  onChangeFilterText: (filter: string) => void;
  filterText: string;
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
  onChangeFilterText,
  filterText,
  noItems,
}: Props) {
  const hasResources = resources.length > 0;

  function renderListContent() {
    if (hasResources) {
      return resources.map((r) => (
        <KGItem
          key={r.id}
          onEnter={onEnter}
          onLeave={onLeave}
          onClick={onClick}
          resource={r}
        />
      ));
    }
    return <NoItems {...noItems} />;
  }
  return (
    <div className={styles.list}>
      <div className={styles.top}>
        {header}
        {hasResources && (
          <TextInput
            formValue={filterText}
            onChange={(value: string) => onChangeFilterText(value)}
            Icon={IconSearch}
            placeholder={'Find a paper...'}
            showClearButton
            hideLabel
            hideBottomText
          />
        )}
      </div>
      <div className={styles.listWrapper}>{renderListContent()}</div>
    </div>
  );
}

export default ResourcesList;
