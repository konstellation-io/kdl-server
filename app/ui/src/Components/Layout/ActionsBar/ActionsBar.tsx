import React, { FC } from 'react';

import { HorizontalBar } from 'kwc';
import cx from 'classnames';
import styles from './ActionsBar.module.scss';

type Props = {
  centerActions?: boolean;
  children: JSX.Element | JSX.Element[];
  className?: string;
};
const ActionsBar: FC<Props> = ({
  children,
  centerActions = false,
  className,
}) => {
  return (
    <div className={cx(styles.container, className)}>
      <HorizontalBar
        className={cx(styles.actions, { [styles.center]: centerActions })}
      >
        {children}
      </HorizontalBar>
    </div>
  );
};

export default ActionsBar;
