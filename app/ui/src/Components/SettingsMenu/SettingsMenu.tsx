import {
  Button,
  BUTTON_ALIGN,
  CustomOptionProps,
  Select,
  SelectTheme,
} from 'kwc';
import ROUTE from 'Constants/routes';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { GetMe } from 'Graphql/queries/types/GetMe';
import { Logout } from 'Graphql/mutations/types/Logout';
import KeyIcon from '@material-ui/icons/VpnKey';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import styles from './SettingsMenu.module.scss';

import { useQuery, useMutation } from '@apollo/client';
import GetMeQuery from 'Graphql/queries/getMe';
import logoutMutation from 'Graphql/mutations/logout';

function SettingsMenu() {
  const history = useHistory();
  const { data } = useQuery<GetMe>(GetMeQuery);
  const [doLogout] = useMutation<Logout>(logoutMutation, {
    onCompleted: () => history.push(ROUTE.HOME),
  });

  function goToUserSSHKeys() {
    history.push(ROUTE.USER_SSH_KEY);
  }

  function UserSettingsSeparator({ label }: CustomOptionProps) {
    return (
      <Button
        label={label.toUpperCase()}
        key="separator"
        className={styles.separator}
        align={BUTTON_ALIGN.LEFT}
      />
    );
  }

  const LogoutButton = () => (
    <Button
      label="Sign out"
      key="Sign out"
      onClick={() => doLogout()}
      Icon={LogoutIcon}
      className={styles.settingButton}
      align={BUTTON_ALIGN.LEFT}
    />
  );
  const SSHKeyButton = () => (
    <Button
      label="SSH key"
      key="SSH key"
      onClick={goToUserSSHKeys}
      Icon={KeyIcon}
      className={styles.settingButton}
      align={BUTTON_ALIGN.LEFT}
    />
  );

  const optionToButton = {
    'sign out': LogoutButton,
    'user settings': UserSettingsSeparator,
    'ssh key': SSHKeyButton,
  };

  return (
    <div>
      <Select
        label=""
        placeholder={data?.me?.email}
        options={Object.keys(optionToButton)}
        theme={SelectTheme.DARK}
        CustomOptions={optionToButton}
        className={styles.settings}
        showSelectAllOption={false}
        shouldSort={false}
        hideError
      />
    </div>
  );
}

export default memo(SettingsMenu);
