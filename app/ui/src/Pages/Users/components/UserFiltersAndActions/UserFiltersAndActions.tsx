import { Button, Left, Right } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import * as React from 'react';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import IconSync from '@material-ui/icons/Cached';
import styles from './UserFiltersAndActions.module.scss';
import { useMutation } from '@apollo/client';

import { SyncUsers } from 'Graphql/mutations/types/SyncUsers';
import { toast } from 'react-toastify';
import useActionDisableDelay from 'Hooks/useActionDisableDelay';
import { CONFIG } from 'index';

import syncUsersMutation from 'Graphql/mutations/syncUsers';

type Props = {
  onUpdateAccessLevel: (newAccessLevel: AccessLevel) => void;
  canManageUsers: boolean;
};

function UserFiltersAndActions({ onUpdateAccessLevel, canManageUsers }: Props) {
  const [syncDisabled, disableSyncAction] = useActionDisableDelay(3000);
  const [syncUsers, { loading }] = useMutation<SyncUsers>(syncUsersMutation, {
    onCompleted: () => {
      toast.dismiss();
      toast.info('User synchronization has started');

      disableSyncAction();
    },
  });

  function onManageUsers() {
    window.open(`${CONFIG.GITEA_URL}/admin/users`);
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
            label="Synchronize"
            onClick={onSync}
            loading={loading}
            disabled={syncDisabled || !canManageUsers}
            border
          />
        </div>
        <div>
          <Button label="Manage users" onClick={onManageUsers} disabled={!canManageUsers} border />
        </div>
      </Right>
    </div>
  );
}

export default UserFiltersAndActions;
