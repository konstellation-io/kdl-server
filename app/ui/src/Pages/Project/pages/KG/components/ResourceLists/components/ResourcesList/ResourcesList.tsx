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
  idToFullResource: { [key: string]: any };
};
function ResourcesList({
  header = null,
  resources,
  onClick,
  onEnter,
  onLeave,
  onChangeFilterText,
  filterText,
  idToFullResource,
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
            idToFullResource={idToFullResource}
          />
        ))}
      </div>
    </div>
  );
}

export default ResourcesList;
