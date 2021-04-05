import {
  ErrorMessage,
  ModalContainer,
  ModalLayoutConfirmList,
  SpinnerCircular,
} from 'kwc';
import {
  GET_USER_SETTINGS,
  GetUserSettings,
} from 'Graphql/client/queries/getUserSettings.graphql';
import {
  defaultModalInfo,
  getModalInfo,
  ModalInfo,
} from './confirmationModals';
import React, { useRef } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers } from 'Graphql/queries/types/GetUsers';
import UserFiltersAndActions from './components/UserFiltersAndActions/UserFiltersAndActions';
import UserRow from './components/UserRow/UserRow';
import { loader } from 'graphql.macro';
import styles from './Users.module.scss';
import useBoolState from 'Hooks/useBoolState';
import { useQuery } from '@apollo/client';
import useUser from 'Graphql/hooks/useUser';
import UsersTable from './components/UserList/UsersTable';

const GetUsersQuery = loader('Graphql/queries/getUsers.graphql');

function Users() {
  const { data, loading, error } = useQuery<GetUsers>(GetUsersQuery);
  const { data: localData } = useQuery<GetUserSettings>(GET_USER_SETTINGS);
  const { updateUsersAccessLevel } = useUser();

  const {
    value: modalVisible,
    activate: showModal,
    deactivate: hideModal,
  } = useBoolState(false);
  const modalInfo = useRef<ModalInfo>(defaultModalInfo);

  const selectedUsers = localData?.userSettings.selectedUserIds || [];

  function getUsersInfo(user?: [string]) {
    const userIds = user || selectedUsers;
    const nUsers = userIds.length;
    const plural = nUsers > 1;

    return { userIds, nUsers, plural };
  }

  function onUpdateAccessLevel(newAccessLevel: AccessLevel, user?: [string]) {
    const usersInfo = getUsersInfo(user);

    showModal();
    modalInfo.current = getModalInfo({
      type: 'update',
      action: () => {
        updateUsersAccessLevel(usersInfo.userIds, newAccessLevel);
        hideModal();
      },
      accessLevel: newAccessLevel,
      ...usersInfo,
    });
  }

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;

    return (
      <>
        <UserFiltersAndActions onUpdateAccessLevel={onUpdateAccessLevel} />
        <UsersTable users={data.users} />
      </>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.sectionTitle}>Users</h1>
      {getContent()}
      {modalVisible && (
        <ModalContainer
          title={modalInfo.current.title}
          onAccept={modalInfo.current.action}
          onCancel={hideModal}
          actionButtonLabel={modalInfo.current.acceptLabel}
          className={styles.modal}
          blocking
        >
          <ModalLayoutConfirmList message={modalInfo.current.message}>
            {modalInfo.current.userIds.map((userId) => {
              const user = data?.users.find((u) => u.id === userId);
              return (
                <UserRow
                  key={user?.email}
                  email={user?.email}
                  accessLevel={user?.accessLevel}
                />
              );
            })}
          </ModalLayoutConfirmList>
        </ModalContainer>
      )}
    </div>
  );
}

export default Users;
