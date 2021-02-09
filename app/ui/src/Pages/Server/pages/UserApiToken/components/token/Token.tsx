import React, { FC } from 'react';

import { Button } from 'kwc';
import ConfirmAction from 'Components/Layout/ConfirmAction/ConfirmAction';
import DeleteIcon from '@material-ui/icons/Delete';
import KeyIcon from '@material-ui/icons/VpnKey';
import styles from './Token.module.scss';

type Props = {
  name: string;
  creationDate: string;
  lastUsedDate: string;
  removeToken: (apiTokenId: string) => void;
};

const Token: FC<Props> = ({
  name,
  creationDate,
  lastUsedDate,
  removeToken,
}) => (
  <div className={styles.container}>
    <div className={styles.wrapper}>
      <div className={styles.labelContainer}>
        <div className={styles.labelWrapper}>
          <KeyIcon className="icon-small" />
          <div className={styles.infoContainer}>
            <span className={styles.label}>{name}</span>
            <div className={styles.datesContainer}>
              <div>
                <span className={styles.dateLabel}>GENERATED ON:</span>
                <span className={styles.date}>{creationDate}</span>
              </div>
              <div>
                <span className={styles.dateLabel}>LAST USED:</span>
                <span className={styles.date}>{lastUsedDate}</span>
              </div>
            </div>
          </div>
        </div>
        <ConfirmAction
          title="DELETE API TOKEN"
          subtitle="To be sure, type the word “DELETE” and will be deleted now."
          action={removeToken}
          confirmationWord={'DELETE'}
          showInput
          error
        >
          <Button label="DELETE" Icon={DeleteIcon} />
        </ConfirmAction>
      </div>
    </div>
  </div>
);

export default Token;
