import {
  Button,
  BUTTON_ALIGN,
  CustomOptionProps,
  Select,
  SelectTheme,
  SpinnerCircular,
} from 'kwc';
import ROUTE from 'Constants/routes';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { GetMe } from 'Graphql/queries/types/GetMe';
import KeyIcon from '@material-ui/icons/VpnKey';
import styles from './SettingsMenu.module.scss';
import { useQuery } from '@apollo/client';
import { CONFIG } from 'index';

import GetMeQuery from 'Graphql/queries/getMe';

const UserSettingsSeparator = ({ label }: CustomOptionProps) => (
  <div className={styles.separator}>{label.toUpperCase()}</div>
);

const ReleaseVersion = ({ label }: CustomOptionProps) => (
  <div className={styles.releaseVersion}>{label}</div>
);

function SettingsMenu() {
  const history = useHistory();
  const { data, loading } = useQuery<GetMe>(GetMeQuery);

  if (loading) return <SpinnerCircular />;

  function goToUserSSHKeys() {
    history.push(ROUTE.USER_SSH_KEY);
  }

  function SSHKeyButton() {
    return (
      <Button
        label="SSH key"
        key="SSH key"
        onClick={goToUserSSHKeys}
        Icon={KeyIcon}
        className={styles.settingButton}
        align={BUTTON_ALIGN.LEFT}
      />
    );
  }

  const optionToButton = {
    'user settings': UserSettingsSeparator,
    'ssh key': SSHKeyButton,
    [CONFIG.RELEASE_VERSION]: ReleaseVersion,
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
