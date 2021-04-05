import { Check, CustomOptionProps, Select } from 'kwc';
import {
  GET_USER_SETTINGS,
  GetUserSettings,
} from 'Graphql/client/queries/getUserSettings.graphql';
import React, { FC } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { UserSelection } from 'Graphql/client/models/UserSettings';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './UserFiltersAndActions.module.scss';
import { useQuery } from '@apollo/client';
import useUserSettings from 'Graphql/client/hooks/useUserSettings';

type CheckSelectAllPros = {
  handleCheckClick: (value: boolean) => void;
  userSelection: UserSelection;
};
const CheckSelectAll: FC<CheckSelectAllPros> = ({
  handleCheckClick,
  userSelection,
}) => (
  <div className={styles.selectAll}>
    <Check
      onChange={handleCheckClick}
      checked={userSelection === UserSelection.ALL}
      indeterminate={userSelection === UserSelection.INDETERMINATE}
    />
    <span>Select All</span>
  </div>
);

const CustomSeparator: FC<CustomOptionProps> = ({ label }) => (
  <div className={cx(styles.customOption, styles.separator)}>{label}</div>
);

enum Actions {
  CHANGE_ACCESS_LEVEL_TO = 'CHANGE ACCESS LEVEL TO',
  VIEWER = 'VIEWER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

const types = Object.values(Actions);

type Props = {
  onUpdateUsers: (newAccessLevel: AccessLevel) => void;
};

function UserActions({ onUpdateUsers }: Props) {
  const { changeUserSelection } = useUserSettings();

  const { data: localData } = useQuery<GetUserSettings>(GET_USER_SETTINGS);

  const nSelections = localData?.userSettings.selectedUserIds.length || 0;
  const userSelection = get(
    localData?.userSettings,
    'userSelection',
    UserSelection.NONE
  );

  const nSelectionsText = `(${nSelections} selected)`;

  function onAction(action: Actions) {
    switch (action) {
      case Actions.VIEWER:
        onUpdateUsers(AccessLevel.VIEWER);
        break;
      case Actions.MANAGER:
        onUpdateUsers(AccessLevel.MANAGER);
        break;
      case Actions.ADMIN:
        onUpdateUsers(AccessLevel.ADMIN);
        break;
    }
  }

  function handleCheckClick() {
    let newUserSelection = UserSelection.NONE;

    switch (userSelection) {
      case UserSelection.NONE:
        newUserSelection = UserSelection.ALL;
        break;
      case UserSelection.INDETERMINATE:
        newUserSelection = UserSelection.ALL;
        break;
      case UserSelection.ALL:
        newUserSelection = UserSelection.NONE;
        break;
    }

    changeUserSelection(newUserSelection);
  }

  return (
    <div className={styles.actions}>
      <CheckSelectAll
        userSelection={userSelection}
        handleCheckClick={handleCheckClick}
      />
      <span className={styles.nSelections}>{nSelectionsText}</span>
      <div className={styles.formActions}>
        <Select
          label="Actions"
          options={types}
          onChange={onAction}
          placeholder="Select one"
          showSelectAllOption={false}
          shouldSort={false}
          disabled={nSelections === 0}
          disabledOptions={[types[0]]}
          CustomOptions={{
            [Actions.CHANGE_ACCESS_LEVEL_TO]: CustomSeparator,
          }}
        />
      </div>
    </div>
  );
}

export default UserActions;
