import * as React from 'react';
import IconArrowDown from '@material-ui/icons/ArrowDropDown';
import IconArrowUp from '@material-ui/icons/ArrowDropUp';
import styles from './UserList.module.scss';
import { Data } from './UsersTable';
import { HeaderGroup } from 'react-table';

type Props = {
  column: HeaderGroup<Data>;
};

function TableHeader({ column }: Props) {
  const Icon = column.isSortedDesc ? IconArrowDown : IconArrowUp;

  return (
    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
      {column.render('Header')}
      <span>
        {column.isSorted ? (
          <span className={styles.sortIcon}>
            <Icon className="icon-regular" />
          </span>
        ) : (
          ''
        )}
      </span>
    </th>
  );
}

export default TableHeader;
