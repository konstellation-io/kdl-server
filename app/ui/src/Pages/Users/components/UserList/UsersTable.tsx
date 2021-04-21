import { Check, Select } from 'kwc';
import { Column, Row, useRowSelect, useSortBy, useTable } from 'react-table';
import React, { useEffect, useMemo } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers_users } from 'Graphql/queries/types/GetUsers';
import Message from 'Components/Message/Message';
import {
  UserSelection,
  UserSettingsFilters,
} from 'Graphql/client/models/UserSettings';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './UserList.module.scss';
import { useReactiveVar } from '@apollo/client';
import useUserSettings from 'Graphql/client/hooks/useUserSettings';
import TableHeader from './TableHeader';
import useUser from 'Graphql/hooks/useUser';
import { userSettings } from 'Graphql/client/cache';

export type Data = {
  creationDate: string;
  email: string;
  username: string;
  accessLevel: AccessLevel;
  lastActivity: string | null;
  selectedRowIds?: string[];
};

function TableColCheck({
  indeterminate,
  checked,
  onChange,
  className = '',
}: any) {
  return (
    <div className={styles.check}>
      <Check
        onChange={() => onChange && onChange({ target: { checked: !checked } })}
        checked={checked || false}
        indeterminate={indeterminate}
        className={cx(className, { [styles.checked]: checked })}
      />
    </div>
  );
}

function rowNotFiltered(row: GetUsers_users, filters: UserSettingsFilters) {
  let filtered = false;

  if (filters.email && !row.email.includes(filters.email)) filtered = true;
  if (
    filters.accessLevel &&
    row.accessLevel.toLowerCase() !== filters.accessLevel.toLowerCase()
  )
    filtered = true;

  return !filtered;
}

type Props = {
  users: GetUsers_users[];
};

function UsersTable({ users }: Props) {
  const { updateSelection } = useUserSettings();
  const { updateUsersAccessLevel } = useUser();

  const { userSelection, filters, selectedUserIds } = useReactiveVar(
    userSettings
  );

  const data = useMemo(
    () => users.filter((user) => rowNotFiltered(user, filters)),
    [filters, users]
  );

  const initialStateSelectedRowIds = Object.fromEntries(
    data.map((user, idx) => [idx, selectedUserIds.includes(user.id)])
  );

  const columns: Column<Data>[] = useMemo(
    () => [
      {
        Header: 'Date added',
        accessor: 'creationDate',
        Cell: ({ value }) => formatDate(new Date(value)),
      },
      {
        Header: 'User email',
        accessor: 'email',
      },
      {
        Header: 'Username',
        accessor: 'username',
      },
      {
        Header: 'Access level',
        accessor: 'accessLevel',
        Cell: ({ value, row }) => {
          return (
            <div className={styles.levelSelector}>
              <Select
                options={Object.keys(AccessLevel)}
                formSelectedOption={value}
                valuesMapper={{
                  [AccessLevel.ADMIN]: 'Administrator',
                  [AccessLevel.MANAGER]: 'Manager',
                  [AccessLevel.VIEWER]: 'Viewer',
                }}
                height={30}
                onChange={(newValue: AccessLevel) => {
                  // @ts-ignore
                  updateUsersAccessLevel([row.original.id], newValue);
                }}
                hideError
              />
            </div>
          );
        },
      },
      {
        Header: 'Last activity',
        accessor: 'lastActivity',
        Cell: ({ value }) => {
          if (value === null) {
            return '-';
          }
          return formatDate(new Date(value), true);
        },
      },
    ],
    // We want to execute this only when mounting/unmounting
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    toggleAllRowsSelected,
    state: { selectedRowIds },
  } = useTable<Data>(
    {
      columns,
      data,
      initialState: {
        selectedRowIds: initialStateSelectedRowIds,
      },
    },
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((cols) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <TableColCheck
              {...getToggleAllRowsSelectedProps()}
              className={styles.headerCheck}
            />
          ),
          Cell: ({ row }: { row: Row }) => (
            <TableColCheck {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...cols,
      ]);
    }
  );

  useEffect(() => {
    switch (userSelection) {
      case UserSelection.ALL:
        toggleAllRowsSelected(true);
        break;
      case UserSelection.NONE: {
        toggleAllRowsSelected(false);
      }
    }
  }, [userSelection, toggleAllRowsSelected]);

  useEffect(() => {
    const newSelectedUsersPos = Object.entries(selectedRowIds)
      .filter(([_, isSelected]) => isSelected)
      .map(([rowId, _]) => rowId);

    if (selectedUserIds.length !== newSelectedUsersPos.length) {
      let newUserSelection: UserSelection;

      switch (newSelectedUsersPos.length) {
        case 0:
          newUserSelection = UserSelection.NONE;
          break;
        case data.length:
          newUserSelection = UserSelection.ALL;
          break;
        default:
          newUserSelection = UserSelection.INDETERMINATE;
      }

      const newSelectedUsers: string[] = data
        .filter((_: GetUsers_users, idx: number) =>
          newSelectedUsersPos.includes(idx.toString())
        )
        .map((user: GetUsers_users) => user.id);

      updateSelection(newSelectedUsers, newUserSelection);
    }
  }, [selectedRowIds, updateSelection, data, selectedUserIds]);

  if (data.length === 0)
    return <Message text="There are no users with the applied filters" />;

  return (
    <div className={styles.container}>
      <table {...getTableProps()} className={styles.table}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableHeader key={column.id} column={column} />
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
