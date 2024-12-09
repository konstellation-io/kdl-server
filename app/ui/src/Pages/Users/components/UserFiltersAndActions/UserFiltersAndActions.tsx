import { Left } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import * as React from 'react';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import styles from './UserFiltersAndActions.module.scss';

type Props = {
  onUpdateAccessLevel: (newAccessLevel: AccessLevel) => void;
  canManageUsers: boolean;
};

function UserFiltersAndActions({ onUpdateAccessLevel }: Props) {
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
