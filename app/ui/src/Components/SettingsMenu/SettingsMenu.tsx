import {
  BUTTON_ALIGN,
  Button,
  CustomOptionProps,
  Select,
  SelectTheme,
} from 'kwc';
import ROUTE from 'Constants/routes';
import React, { FunctionComponent, memo } from 'react';
import { useHistory } from 'react-router-dom';

import { GetMe } from 'Graphql/queries/types/GetMe';
import KeyIcon from '@material-ui/icons/VpnKey';
import LinkIcon from '@material-ui/icons/Link';
import { loader } from 'graphql.macro';
import styles from './SettingsMenu.module.scss';
import { useQuery } from '@apollo/client';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

interface SettingsButtonProps extends CustomOptionProps {
  onClick: () => void;
  Icon: FunctionComponent;
}
function SettingsButton({ label, onClick, Icon }: SettingsButtonProps) {
  return (
    <Button
      label={label.toUpperCase()}
      onClick={onClick}
      Icon={Icon}
      key={`button${label}`}
      className={styles.settingButton}
      align={BUTTON_ALIGN.LEFT}
    />
  );
}

function SettingsMenu() {
  const history = useHistory();
  const { data } = useQuery<GetMe>(GetMeQuery);

  function goToUserSSHKeys() {
    history.push(ROUTE.USER_SSH_KEY);
  }

  function goToUserAPITokens() {
    history.push(ROUTE.USER_API_TOKENS);
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

  function SSHKeyButton({ label }: CustomOptionProps) {
    return (
      <SettingsButton Icon={KeyIcon} onClick={goToUserSSHKeys} label={label} />
    );
  }

  function apiTokensButton({ label }: CustomOptionProps) {
    return (
      <SettingsButton
        Icon={LinkIcon}
        onClick={goToUserAPITokens}
        label={label}
      />
    );
  }

  const optionToButton = {
    'user settings': UserSettingsSeparator,
    'ssh key': SSHKeyButton,
    'api tokens': apiTokensButton,
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
