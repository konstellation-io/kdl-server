import styles from './UserPageHeader.module.scss';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

type Props = {
  title: string;
};

const UserPageHeader = ({ title }: Props) => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className={styles.containerHeader}>
      <ArrowBackIcon onClick={goBack} className={styles.goBackButton} fontSize="small" />
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
};

export default UserPageHeader;
