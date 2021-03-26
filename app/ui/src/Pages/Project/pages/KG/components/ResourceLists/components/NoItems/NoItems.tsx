import React, { FC } from 'react';
import styles from './NoItems.module.scss';

export type NoItemsProps = {
  title: string;
  subTitle?: string;
};
const NoItems: FC<NoItemsProps> = ({ title, subTitle }) => (
  <div className={styles.resource}>
    <span className={styles.title}>{title}</span>
    {subTitle && <p>{subTitle}</p>}
  </div>
);

export default NoItems;
