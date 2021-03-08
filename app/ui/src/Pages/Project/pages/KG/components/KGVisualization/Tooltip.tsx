import React, { FC } from 'react';

import cx from 'classnames';
import styles from './KGVisualization.module.scss';

type Props = {
  top: number;
  left: number;
  open: boolean;
  onMouseLeave?: () => void;
};

const Tooltip: FC<Props> = ({ top, left, open, onMouseLeave, children }) => (
  <div
    style={{ top, left }}
    className={cx(styles.tooltip, { [styles.open]: open })}
    onMouseLeave={onMouseLeave}
  >
    <div className={styles.tooltipWrapper}>{children}</div>
  </div>
);

export default Tooltip;
