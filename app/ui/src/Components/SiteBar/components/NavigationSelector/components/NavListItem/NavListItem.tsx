import React, { FC } from 'react';
import styles from './NavListItem.module.scss';
import { IconSize } from 'Pages/Project/components/ProjectNavigation/NavigationButton';
import cx from 'classnames';

type Props = {
  label: string;
  Icon: any;
  iconSize?: IconSize;
  disabled?: boolean;
};

const NavListItem: FC<Props> = ({
  label,
  Icon,
  iconSize = IconSize.SMALL,
  disabled = false,
}) => (
  <div className={cx(styles.container, { [styles.disabled]: disabled })}>
    <Icon className={cx(iconSize, styles.icon)} />
    <span className={styles.label}>{label}</span>
  </div>
);
export default NavListItem;
