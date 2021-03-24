import React, { FC } from 'react';
import styles from './NoItems.module.scss';

type Props = {
  title: string;
  subTitle?: string;
};
const NoItems: FC<Props> = ({ title, subTitle }) => (
  <div className={styles.resource}>
    <span className={styles.title}>{title}</span>
    <p>{subTitle}</p>
  </div>
);

export default NoItems;
