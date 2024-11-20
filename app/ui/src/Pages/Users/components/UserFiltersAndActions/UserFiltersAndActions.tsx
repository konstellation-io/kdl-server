import { Button, Left, Right } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import * as React from 'react';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import IconSync from '@material-ui/icons/Cached';
import styles from './UserFiltersAndActions.module.scss';
import { useMutation } from '@apollo/client';

import { toast } from 'react-toastify';
import useActionDisableDelay from 'Hooks/useActionDisableDelay';
import { CONFIG } from 'index';


type Props = {
  onUpdateAccessLevel: (newAccessLevel: AccessLevel) => void;
  canManageUsers: boolean;
};

function UserFiltersAndActions({ onUpdateAccessLevel, canManageUsers }: Props) {
  return (
    <div className={styles.container}>
      <Left className={styles.left}>
        <UserFilters />
        <UserActions onUpdateUsers={onUpdateAccessLevel} />
      </Left>
    </div>
  );
}

export default UserFiltersAndActions;
