import { Button, Left, Right } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import React from 'react';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import IconSync from '@material-ui/icons/Cached';
import styles from './UserFiltersAndActions.module.scss';
import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import { SyncUsers } from 'Graphql/mutations/types/SyncUsers';
import { toast } from 'react-toastify';
import useActionDisableDelay from 'Hooks/useActionDisableDelay';

const syncUsersMutation = loader('Graphql/mutations/syncUsers.graphql');

type Props = {
  onUpdateAccessLevel: (newAccessLevel: AccessLevel) => void;
};

function UserFiltersAndActions({ onUpdateAccessLevel }: Props) {
  const [syncDisabled, disableSyncAction] = useActionDisableDelay(3000);
  const [syncUsers, { loading }] = useMutation<SyncUsers>(syncUsersMutation, {
    onCompleted: () => {
      toast.dismiss();
      toast.info(`User synchronization has started`);

      disableSyncAction();
    },
  });

  function onManageUsers() {
    window.open();
  }

  function onSync() {
    syncUsers();
  }

  return (
    <div className={styles.container}>
      <Left className={styles.left}>
        <UserFilters />
        <UserActions onUpdateUsers={onUpdateAccessLevel} />
      </Left>
      <Right className={styles.buttons}>
        <div>
          <Button
            Icon={IconSync}
            label="SYNCHRONIZE"
            onClick={onSync}
            loading={loading}
            disabled={syncDisabled}
            border
          />
        </div>
        <div>
          <Button label="MANAGE USERS" onClick={onManageUsers} border />
        </div>
      </Right>
    </div>
  );
}

export default UserFiltersAndActions;
