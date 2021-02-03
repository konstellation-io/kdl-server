import React, { FC } from 'react';
import styles from './ArrowsNavigator.module.scss';
import ArrowBack from '@material-ui/icons/ArrowBackIos';
import ArrowForward from '@material-ui/icons/ArrowForwardIos';
import { Button } from 'kwc';

type Props = {
  onBackClick: () => void;
  onForwardClick: () => void;
};

const ArrowsNavigator: FC<Props> = ({ onBackClick, onForwardClick }) => (
  <div className={styles.container}>
    <Button label="" Icon={ArrowBack} onClick={onBackClick} />
    <Button label="" Icon={ArrowForward} onClick={onForwardClick} />
  </div>
);

export default ArrowsNavigator;
