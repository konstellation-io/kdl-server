import React from 'react';
import cx from 'classnames';
import styles from './CircledInfoMessage.module.scss';

export enum CircledInfoMessageTypes {
  SUCCESS = 'success',
  ERROR = 'error',
}

type Props = {
  type: CircledInfoMessageTypes;
  text?: string;
  className?: string;
};

const CircledInfoMessage: React.FC<Props> = ({
  type = CircledInfoMessageTypes.SUCCESS,
  text = '',
  children,
}) => {
  return (
    <div className={cx(styles.circledMessage, styles[type])}>
      {text}
      {children}
    </div>
  );
};

export default CircledInfoMessage;
