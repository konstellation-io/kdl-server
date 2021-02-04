import React, { FC } from 'react';

import { Metric } from './ServerMetrics';
import TimeSeriesChart from 'Components/Charts/TimeSeriesChart/TimeSeriesChart';
import { format } from 'd3-format';
import { formatDate } from 'Utils/format';
import styles from './ServerMetrics.module.scss';

const LastValue: FC<Metric> = ({ label, color, unit, data }) => (
  <div className={styles.chart}>
    <TimeSeriesChart
      title={label}
      color={color}
      data={data}
      unit={unit}
      formatYAxis={(v) => format('.3s')(v)}
      formatXAxis={(date) => formatDate(new Date(date), true)}
      width={365}
      height={170}
      highlightLastValue
    />
  </div>
);

export default LastValue;
