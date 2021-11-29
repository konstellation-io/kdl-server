import { ErrorMessage, ModalContainer, ModalLayoutConfirmList, SpinnerCircular } from 'kwc';
import { defaultModalInfo, getModalInfo, ModalInfo } from './confirmationModals';
import React, { useRef } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers } from 'Graphql/queries/types/GetUsers';
import UserFiltersAndActions from './components/UserFiltersAndActions/UserFiltersAndActions';
import UserRow from './components/UserRow/UserRow';
import styles from './Users.module.scss';
import useBoolState from 'Hooks/useBoolState';
import { useQuery, useReactiveVar } from '@apollo/client';
import useUser from 'Graphql/hooks/useUser';
import UsersTable from './components/UserList/UsersTable';

import GetUsersQuery from 'Graphql/queries/getUsers';
import { userSettings } from 'Graphql/client/cache';
import { GetMe } from 'Graphql/queries/types/GetMe';
import GetMeQuery from 'Graphql/queries/getMe';

function Users() {
  const { data: dataMe, loading: loadingMe, error: errorMe } = useQuery<GetMe>(GetMeQuery);
  const { data, loading, error } = useQuery<GetUsers>(GetUsersQuery);
  const { selectedUserIds } = useReactiveVar(userSettings);
  const { updateUsersAccessLevel } = useUser();

  const { value: modalVisible, activate: showModal, deactivate: hideModal } = useBoolState(false);
  const modalInfo = useRef<ModalInfo>(defaultModalInfo);

  function getUsersInfo(user?: [string]) {
    const userIds = user || selectedUserIds;
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
    if (loading || loadingMe) return <SpinnerCircular />;
    if (error || errorMe || !data) return <ErrorMessage />;

    return (
      <>
        <UserFiltersAndActions
          onUpdateAccessLevel={onUpdateAccessLevel}
          canManageUsers={dataMe?.me.accessLevel === AccessLevel.ADMIN}
        />
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
          actionButtonCancel="Cancel"
          className={styles.modal}
          blocking
        >
          <ModalLayoutConfirmList message={modalInfo.current.message}>
            {modalInfo.current.userIds.map((userId) => {
              const user = data?.users.find((u) => u.id === userId);
              return <UserRow key={user?.email} email={user?.email} accessLevel={user?.accessLevel} />;
            })}
          </ModalLayoutConfirmList>
        </ModalContainer>
      )}
    </div>
  );
}

export default Users;
