import React, { FC } from 'react';
import styles from './NavListItem.module.scss';
import { IconSize } from 'Pages/Project/components/ProjectNavigation/components/NavigationButton/NavigationButton';
import cx from 'classnames';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';

type Props = {
  label: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  iconSize?: IconSize;
  disabled?: boolean;
};

const NavListItem: FC<Props> = ({ label, Icon, iconSize = IconSize.SMALL, disabled = false }) => (
  <div className={cx(styles.container, { [styles.disabled]: disabled })}>
    <Icon className={cx(iconSize, styles.icon)} />
    <span className={styles.label}>{label}</span>
  </div>
);
export default NavListItem;
