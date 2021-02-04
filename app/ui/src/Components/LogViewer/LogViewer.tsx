import React from 'react';
import cx from 'classnames';
import styles from './LogViewer.module.scss';

export type Log = {
  text: string;
  isError?: boolean;
};

interface Props {
  logs: Log[];
}

function LogViewer({ logs }: Props) {
  return (
    <div className={styles.wrapper}>
      {logs.map(({ text, isError = false }, idx) => (
        <p key={idx} className={cx(styles.log, { [styles.error]: isError })}>
          {text}
        </p>
      ))}
    </div>
  );
}

export default LogViewer;
