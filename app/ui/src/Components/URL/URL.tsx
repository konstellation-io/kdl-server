import React, { FC } from 'react';

import cx from 'classnames';
import styles from './URL.module.scss';

type Props = {
  children: string;
  className?: string;
};
const URL: FC<Props> = ({ children, className }) => (
  <div
    className={cx(styles.url, className)}
    onClick={() => window.open(children)}
  >
    {children}
  </div>
);

export default URL;
