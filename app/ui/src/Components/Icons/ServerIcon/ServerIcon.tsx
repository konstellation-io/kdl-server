import { SvgIcon, SvgIconProps } from '@material-ui/core';

import React from 'react';
import cx from 'classnames';
import styles from './ServerIcon.module.scss';

const ServerIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} className={cx(props.className, styles.serverIcon)}>
    <g>
      <polygon points="3,20 12,2 21,20" />
    </g>
  </SvgIcon>
);

export default ServerIcon;
