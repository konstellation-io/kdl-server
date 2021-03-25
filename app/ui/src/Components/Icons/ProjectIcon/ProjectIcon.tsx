import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';
import styles from './ProjectIcon.module.scss';
import cx from 'classnames';

interface AdditionalProps {
  isArchived: boolean;
}

const ProjectIcon = (props: AdditionalProps & SvgIconProps) => (
  <SvgIcon
    {...props}
    className={cx(props.className, {
      [styles.STARTED]: !props.isArchived,
      [styles.ARCHIVED]: props.isArchived,
    })}
  >
    <g>
      <polygon points="2,12 6,3 22,3 18,12 22,21 6,21" />
    </g>
  </SvgIcon>
);
export default ProjectIcon;
