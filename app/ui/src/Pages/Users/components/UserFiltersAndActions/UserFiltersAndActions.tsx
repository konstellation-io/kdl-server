import { Button, Left, Right } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import ROUTE from 'Constants/routes';
import React from 'react';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import styles from './UserFiltersAndActions.module.scss';

type Props = {
  onDeleteUsers: () => void;
  onUpdateAccessLevel: (newAccessLevel: AccessLevel) => void;
};
function UserFiltersAndActions({ onDeleteUsers, onUpdateAccessLevel }: Props) {
  return (
    <div className={styles.container}>
      <Left className={styles.left}>
        <UserFilters />
        <UserActions
          onDeleteUsers={onDeleteUsers}
          onUpdateUsers={onUpdateAccessLevel}
        />
      </Left>
      <Right>
        <Button label="NEW USER" to={ROUTE.NEW_USER} border />
      </Right>
    </div>
  );
}

export default UserFiltersAndActions;
