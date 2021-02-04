import React, { FC } from 'react';

import ActionsBar from 'Components/Layout/ActionsBar/ActionsBar';
import Sidebar from './Sidebar';
import styles from './DefaultPage.module.scss';

type Props = {
  title: string;
  subtitle?: string;
  children: JSX.Element;
  actions?: JSX.Element | JSX.Element[];
};
const DefaultPage: FC<Props> = ({ title, subtitle, actions, children }) => (
  <div className={styles.container}>
    <Sidebar title={title} subtitle={subtitle} />
    <div className={styles.content}>
      <div className={styles.children}>{children}</div>
      {actions && <ActionsBar className={styles.actions}>{actions}</ActionsBar>}
    </div>
  </div>
);

export default DefaultPage;
