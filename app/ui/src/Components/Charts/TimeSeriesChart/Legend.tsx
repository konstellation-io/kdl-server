import React, { useMemo } from 'react';

import styles from './TimeSeriesChart.module.scss';

type Props = {
  highlightLastValue?: boolean;
  lastValue?: string;
  title: string;
  color: string;
};
function Legend({
  lastValue,
  title,
  color,
  highlightLastValue = false,
}: Props) {
  const colorStyle = useMemo(() => ({ color }), [color]);
  const bgColorStyle = useMemo(() => ({ backgroundColor: color }), [color]);

  return (
    <div className={styles.topPannel}>
      {highlightLastValue && (
        <div className={styles.lastValue} style={colorStyle}>
          {lastValue}
        </div>
      )}
      <div className={styles.legend}>
        <div className={styles.legendCircle} style={bgColorStyle} />
        {title}
      </div>
    </div>
  );
}

export default Legend;
