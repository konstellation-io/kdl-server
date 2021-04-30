import React, { FC } from 'react';

import { Button } from 'kwc';
import { GetSSHKey_me_sshKey } from 'Graphql/queries/types/GetSSHKey';
import IconCalendar from '@material-ui/icons/Event';
import IconTime from '@material-ui/icons/Schedule';
import { copyAndToast } from 'Utils/clipboard';
import { formatDate } from 'Utils/format';
import styles from './SSHKey.module.scss';
import Message from '../../../../Components/Message/Message';

type Props = {
  sshKey: GetSSHKey_me_sshKey;
};
const SSHKey: FC<Props> = ({
  sshKey: { public: key, lastActivity, creationDate },
}) => (
  <div>
    {key ? (
      <>
        <p className={styles.fieldLabel}>KEY</p>
        <div className={styles.key}>
          <div className={styles.keyValue} title={key}>
            {key}
          </div>
          <p className={styles.copyPre}>TO SEE THE KEY, JUST</p>
          <Button
            className={styles.copy}
            label="Copy it"
            onClick={() => copyAndToast(key)}
            height={30}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.infoEl}>
            <IconCalendar className="icon-small" />
            <p className={styles.infoValue}>{`ADDED ON ${formatDate(
              new Date(creationDate)
            )}`}</p>
          </div>
          <div className={styles.infoEl}>
            <IconTime className="icon-small" />
            <p className={styles.infoValue}>
              {lastActivity
                ? `LAST USED ON ${formatDate(new Date(lastActivity))}`
                : 'STILL NOT USED'}
            </p>
          </div>
        </div>
      </>
    ) : (
      <Message text="It seems you don't have an SSH key associated with your account." />
    )}
  </div>
);

export default SSHKey;
