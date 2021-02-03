import React, { FC } from 'react';

import styles from './TimeSeriesChart.module.scss';

type Props = {
  xValue: string;
  yValue: string;
  title: string;
  color: string;
};
const TooltipContent: FC<Props> = ({ xValue, yValue, title, color }) => (
  <>
    <div className={styles.head}>{xValue}</div>
    <div className={styles.body}>
      <span>{`${title}: `}</span>
      <span className={styles.value} style={{ color }}>
        {yValue}
      </span>
    </div>
  </>
);

export default TooltipContent;
