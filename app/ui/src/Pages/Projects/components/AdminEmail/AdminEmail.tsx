import styles from './AdminEmail.module.scss';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import { Button } from 'kwc';
import IconSend from '@material-ui/icons/Send';
import * as React from 'react';

type Props = {
  email: string;
};
function AdminEmail({ email }: Props) {
  function onSendEmail() {
    window.open(`mailto:${email}`);
  }

  return (
    <div className={styles.adminEmail}>
      <span>{email}</span>
      <div className={styles.actions}>
        <CopyToClipboard>{email}</CopyToClipboard>
        <Button Icon={IconSend} label={''} onClick={onSendEmail} />
      </div>
    </div>
  );
}

export default AdminEmail;
