import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';
import styles from './RuntimeIcon.module.scss';
import cx from 'classnames';

export enum RUNTIME_STATUS {
  RUNNING,
  STOPPED,
  LOADING,
  PENDING,
  ERROR,
  NOT_SELECTED,
}

interface AdditionalProps {
  status: RUNTIME_STATUS;
}

const RuntimeIcon = (props: AdditionalProps & SvgIconProps) => (
  <SvgIcon className={cx(styles.icon, props.className)}>
    <g>
      <circle
        cx="12"
        cy="12"
        r="7"
        className={cx({
          [styles.RUNNING]: props.status === RUNTIME_STATUS.RUNNING,
          [styles.STOPPED]: props.status === RUNTIME_STATUS.STOPPED,
          [styles.LOADING]: props.status === RUNTIME_STATUS.LOADING,
          [styles.PENDING]: props.status === RUNTIME_STATUS.PENDING,
          [styles.ERROR]: props.status === RUNTIME_STATUS.ERROR,
          [styles.NOT_SELECTED]: props.status === RUNTIME_STATUS.NOT_SELECTED,
        })}
      />
    </g>
  </SvgIcon>
);

export default RuntimeIcon;
