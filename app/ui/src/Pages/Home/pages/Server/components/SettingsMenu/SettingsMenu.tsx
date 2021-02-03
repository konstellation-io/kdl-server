import {
  BUTTON_ALIGN,
  Button,
  CustomOptionProps,
  ModalContainer,
  ModalLayoutInfo,
  Select,
  SelectTheme,
} from 'kwc';
import ROUTE, { RouteServerParams, buildRoute } from 'Constants/routes';
import React, { FunctionComponent, memo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import CloseIcon from '@material-ui/icons/Close';
import { GetMe } from 'Graphql/queries/types/GetMe';
import KeyIcon from '@material-ui/icons/VpnKey';
import LogoutIcon from '@material-ui/icons/ExitToApp';
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
  const { serverId } = useParams<RouteServerParams>();
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  function doLogout() {
    // TODO: what to do when logout?
    // TODO: impletent this will main process
    // ipcRenderer.send('serverLogout', serverId);
    history.push(ROUTE.HOME);
  }

  function doDisconnect() {
    // TODO: what to do when disconnect?
    // history.push(ROUTE.HOME);
    history.push(ROUTE.HOME);
  }

  function goToUserSSHKeys() {
    history.push(buildRoute.server(ROUTE.USER_SSH_KEY, serverId));
  }

  function goToUserAPITokens() {
    history.push(buildRoute.server(ROUTE.USER_API_TOKENS, serverId));
  }

  function LogoutButton({ label }: CustomOptionProps) {
    return (
      <SettingsButton Icon={LogoutIcon} onClick={openModal} label={label} />
    );
  }

  function DisconnectButton({ label }: CustomOptionProps) {
    return (
      <SettingsButton Icon={CloseIcon} onClick={doDisconnect} label={label} />
    );
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
    disconnect: DisconnectButton,
    'sign out': LogoutButton,
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
      {showModal && (
        <ModalContainer
          title="YOU ARE ABOUT TO SIGN OUT THIS SERVER"
          actionButtonLabel="SIGN OUT"
          onAccept={doLogout}
          onCancel={closeModal}
          blocking
        >
          <ModalLayoutInfo>
            <p className={styles.logoutMessage}>
              You will be redirected to Server list. To access this server
              again, you will have to sign in again.
            </p>
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default memo(SettingsMenu);
