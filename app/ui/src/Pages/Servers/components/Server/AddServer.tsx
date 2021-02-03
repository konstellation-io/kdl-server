import IconAdd from '@material-ui/icons/Add';
import React from 'react';
import styles from './Server.module.scss';
import { useHistory } from 'react-router-dom';

type Props = {
  label: string;
  to: string;
};
function AddServer({ label, to }: Props) {
  const history = useHistory();

  return (
    <div className={styles.addServerContainer}>
      <div className={styles.addServerBg} onClick={() => history.push(to)} />
      <div className={styles.addServerLabel}>
        <IconAdd className="icon-regular" />
        <p>{label}</p>
      </div>
    </div>
  );
}

export default AddServer;
