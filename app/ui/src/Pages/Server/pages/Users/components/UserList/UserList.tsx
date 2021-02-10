import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers_users } from 'Graphql/queries/types/GetUsers';
import IconDelete from '@material-ui/icons/Delete';
import { MenuCallToAction } from 'kwc';
import React from 'react';
import UsersTable from './UsersTable';
import styles from './UserList.module.scss';

type Props = {
  users: GetUsers_users[];
  onDeleteUsers: (user?: [string]) => void;
  onUpdateAccessLevel: (accessLevel: AccessLevel, user?: [string]) => void;
};
function UserList({ users, onDeleteUsers, onUpdateAccessLevel }: Props) {
  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconDelete,
      text: 'delete',
      callToAction: (_: any, userId: string) => onDeleteUsers([userId]),
    },
    {
      text: 'change access level to',
      separator: true,
    },
    {
      text: 'viewer',
      callToAction: (_: any, userId: string) =>
        onUpdateAccessLevel(AccessLevel.VIEWER, [userId]),
    },
    {
      text: 'manager',
      callToAction: (_: any, userId: string) =>
        onUpdateAccessLevel(AccessLevel.MANAGER, [userId]),
    },
    {
      text: 'administrator',
      callToAction: (_: any, userId: string) =>
        onUpdateAccessLevel(AccessLevel.ADMIN, [userId]),
    },
  ];

  return (
    <div className={styles.container}>
      <UsersTable users={users} contextMenuActions={contextMenuActions} />
    </div>
  );
}

export default UserList;
