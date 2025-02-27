import { Button, BUTTON_ALIGN, CustomOptionProps, Select, SelectTheme, SpinnerCircular } from 'kwc';
import ROUTE from 'Constants/routes';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import { GetMe } from 'Graphql/queries/types/GetMe';
import KeyIcon from '@material-ui/icons/VpnKey';
import DescriptionIcon from '@material-ui/icons/Description';
import ExitToApp from '@material-ui/icons/ExitToApp';
import styles from './SettingsMenu.module.scss';
import { useQuery, useReactiveVar } from '@apollo/client';
import { CONFIG } from 'index';

import GetMeQuery from 'Graphql/queries/getMe';
import { runningRuntime } from 'Graphql/client/cache';

const UserSettingsSeparator = ({ label }: CustomOptionProps) => (
  <div className={styles.separator}>{label.toUpperCase()}</div>
);

const ReleaseVersion = ({ label }: CustomOptionProps) => <div className={styles.releaseVersion}>{label}</div>;

function SettingsMenu() {
  const history = useHistory();
  const { data, loading } = useQuery<GetMe>(GetMeQuery);
  const runtimeRunning = useReactiveVar(runningRuntime);

  if (loading) return <SpinnerCircular />;

  function goToUserSSHKeys() {
    history.push(ROUTE.USER_SSH_KEY);
  }

  function goToUserKubeconfig() {
    history.push(ROUTE.USER_KUBECONFIG);
  }

  function goToLogout() {
    window.location.href = ROUTE.LOGOUT;
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

  function kubeconfigButton() {
    if (!data?.me.isKubeconfigEnabled || !runtimeRunning) {
      return (
        <Button
          label="Kubeconfig"
          key="Kubeconfig"
          disabled
          Icon={DescriptionIcon}
          className={styles.settingButtonDisabled}
          align={BUTTON_ALIGN.LEFT}
        />
    )};

    return (
      <Button
        label="Kubeconfig"
        key="Kubeconfig"
        onClick={goToUserKubeconfig}
        Icon={DescriptionIcon}
        className={styles.settingButton}
        align={BUTTON_ALIGN.LEFT}
      />
    );
  }

  function logoutButton() {
    return (
      <Button
        label="Logout"
        key="logout"
        onClick={goToLogout}
        Icon={ExitToApp}
        className={styles.logoutButton}
        align={BUTTON_ALIGN.LEFT}
      />
    );
  }

  const optionToButton = {
    'user settings': UserSettingsSeparator,
    'ssh key': SSHKeyButton,
    kubeconfig: kubeconfigButton,
    'log out': logoutButton,
    [CONFIG.RELEASE_VERSION]: ReleaseVersion,
  };

  return (
    <div data-testid="settingsCrumb">
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
