import React from 'react';
import cx from 'classnames';
import styles from './NavigationButton.module.scss';

export enum IconSize {
  SMALL = 'icon-small',
  REGULAR = 'icon-regular',
}

type Props = {
  label: string;
  Icon: any;
  title?: string;
  iconSize?: IconSize;
};

function NavigationButton({
  label,
  title,
  Icon,
  iconSize = IconSize.REGULAR,
}: Props) {
  return (
    <div className={styles.navButton} title={title || label}>
      <Icon className={cx(iconSize, styles.icon)} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default NavigationButton;
