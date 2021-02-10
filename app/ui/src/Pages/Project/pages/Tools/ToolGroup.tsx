import React, { FC } from 'react';

import styles from './Tools.module.scss';

type Props = {
  title: string;
  children: JSX.Element | JSX.Element[];
};
const ToolGroup: FC<Props> = ({ title, children }) => (
  <div className={styles.group}>
    <p className={styles.groupTitle}>{title}</p>
    <div className={styles.groupContent}>{children}</div>
  </div>
);

export default ToolGroup;
