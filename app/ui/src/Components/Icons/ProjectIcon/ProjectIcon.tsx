import { SvgIcon, SvgIconProps } from '@material-ui/core';
import * as React from 'react';
import styles from './ProjectIcon.module.scss';
import cx from 'classnames';

interface AdditionalProps {
  archived: boolean;
}

const ProjectIcon = (props: AdditionalProps & SvgIconProps) => (
  <SvgIcon
    className={cx(styles.icon, props.className, {
      [styles.ARCHIVED]: props.archived,
    })}
  >
    <g>
      <polygon points="2,12 6,3 22,3 18,12 22,21 6,21" />
    </g>
  </SvgIcon>
);

export default ProjectIcon;
