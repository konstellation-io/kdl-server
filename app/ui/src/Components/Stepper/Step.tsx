import React, { MouseEvent } from 'react';

import IconCompleted from '@material-ui/icons/Check';
import IconDisabled from '@material-ui/icons/NotInterested';
import IconIncomplete from '@material-ui/icons/Schedule';
import IconActive from '@material-ui/icons/Create';
import cx from 'classnames';
import styles from './Stepper.module.scss';

type Props = {
  label: string;
  error: boolean;
  completed: boolean;
  active: boolean;
  visited: boolean;
  disabled: boolean;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
};
function Step({ label, completed, active, visited, onClick, disabled }: Props) {
  let Icon;
  switch (true) {
    case completed:
      Icon = IconCompleted;
      break;
    case disabled:
      Icon = IconDisabled;
      break;
    case active:
      Icon = IconActive;
      break;
    default:
      Icon = IconIncomplete;
  }

  return (
    <div
      className={cx(styles.step, {
        [styles.completed]: completed,
        [styles.active]: active,
        [styles.visited]: visited,
        [styles.disabled]: !completed && disabled,
      })}
      onClick={onClick}
    >
      <div className={styles.circle}>
        <Icon className="icon-small" />
      </div>
      <p className={cx(styles.label)}>{label}</p>
    </div>
  );
}

export default Step;
