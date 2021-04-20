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
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

function NavigationButton({
  label,
  title,
  Icon,
  onClick,
  className = '',
  iconSize = IconSize.REGULAR,
  disabled = false,
}: Props) {
  return (
    <div
      className={cx(styles.navButton, className, {
        [styles.disabled]: disabled,
      })}
      title={title || label}
      onClick={onClick}
    >
      <Icon className={cx(iconSize, styles.icon)} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default NavigationButton;
