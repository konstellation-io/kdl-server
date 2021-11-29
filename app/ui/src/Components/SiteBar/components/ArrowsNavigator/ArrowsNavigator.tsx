import * as React from 'react';
import styles from './ArrowsNavigator.module.scss';
import ArrowBack from '@material-ui/icons/ArrowBackIos';
import ArrowForward from '@material-ui/icons/ArrowForwardIos';
import { Button } from 'kwc';
import { useHistory } from 'react-router-dom';

function ArrowsNavigator() {
  const { goBack, goForward } = useHistory();

  return (
    <div className={styles.container}>
      <Button label="" Icon={ArrowBack} onClick={goBack} />
      <Button label="" Icon={ArrowForward} onClick={goForward} />
    </div>
  );
}

export default ArrowsNavigator;
