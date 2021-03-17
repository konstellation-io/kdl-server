import { Check } from 'kwc';
import React from 'react';
import { Topic } from '../../Filters';
import cx from 'classnames';
import styles from './ShowOthersFilter.module.scss';

interface Props {
  showOthers: boolean;
  onUpdate: (showOthers: boolean) => void;
}

function ShowOthersFilter({ showOthers, onUpdate }: Props) {
  return (
    <div className={styles.container}>
      <Check checked={showOthers} onChange={onUpdate} />
      <div className={styles.text}>Other Topics</div>
    </div>
  );
}

export default ShowOthersFilter;
