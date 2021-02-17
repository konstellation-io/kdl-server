import React, { FC } from 'react';

import IconOpen from '@material-ui/icons/ArrowForward';
import { TextTooltipInfo } from 'Hooks/useTextTooltip';
import cx from 'classnames';
import styles from './KGVisualization.module.scss';

const Tooltip: FC<TextTooltipInfo> = ({ top, left, text, open }) => (
  <div
    style={{ top: top - 2, left: left - 2 }}
    className={cx(styles.tooltip, { [styles.open]: open })}
  >
    <div className={styles.tooltipWrapper}>
      <div className={styles.tooltipText}>{ text }</div>
      <IconOpen className={cx(styles.tooltipIcon, 'icon-regular')} />
      <div className={styles.tooltipBg} />
    </div>
  </div>
);

export default Tooltip;
