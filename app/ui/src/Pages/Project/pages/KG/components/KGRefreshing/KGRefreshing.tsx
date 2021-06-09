import React from 'react';
import { SpinnerCircular } from 'kwc';
import styles from './KGRefreshing.module.scss';

function KGRefreshing() {
  return (
    <div className={styles.container}>
      <SpinnerCircular size={90} />
    </div>
  );
}

export default KGRefreshing;
