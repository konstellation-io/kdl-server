import * as React from 'react';
import cx from 'classnames';
import styles from './NavigationButton.module.scss';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';

export enum IconSize {
  SMALL = 'icon-small',
  REGULAR = 'icon-regular',
}

type Props = {
  label: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  title?: string;
  iconSize?: IconSize;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  dataTestId?: string;
  isNavCollapsed?: boolean;
};

function NavigationButton({
  label,
  title,
  Icon,
  onClick,
  isNavCollapsed = false,
  className = '',
  dataTestId = undefined,
  iconSize = IconSize.REGULAR,
  disabled = false,
}: Props) {
  return (
    <div
      className={cx(
        styles.navButton,
        className,
        {
          [styles.navCollapsed]: isNavCollapsed,
        },
        {
          [styles.disabled]: disabled,
        },
      )}
      title={title || label}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <Icon className={cx(iconSize, styles.icon)} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default NavigationButton;
