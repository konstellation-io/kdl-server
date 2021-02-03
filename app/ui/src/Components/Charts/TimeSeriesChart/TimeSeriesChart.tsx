import {
  AnimatedAreaSeries,
  AnimatedAxis,
  AnimatedGrid,
  XYChart,
} from '@visx/xychart';
import { Bar, Line } from '@visx/shape';
import React, { useCallback, useMemo } from 'react';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { bisector, extent } from 'd3-array';
import { scaleLinear, scaleTime } from '@visx/scale';

import Legend from './Legend';
import { Spring } from 'react-spring/renderprops';
import TooltipContent from './TooltipContent';
import cx from 'classnames';
import { localPoint } from '@visx/event';
import styles from './TimeSeriesChart.module.scss';
import { useEffect } from 'react';

export type D = {
  x: Date;
  y: number;
};

const x = (d: D) => d.x;
const y = (d: D) => d.y;
const bisectDate = bisector<D, Date>((d) => new Date(d.x)).left;

const margin = { top: 10, right: 0, bottom: 0, left: 0 };
const xyChartXScale: any = { type: 'time' };
const gridLineProps = { stroke: '#313131' };

type Props = {
  data: D[];
  unit: string;
  title: string;
  width: number;
  height: number;
  formatXAxis?: (value: string) => string;
  formatYAxis?: (value: number) => string;
  highlightLastValue?: boolean;
  color?: string;
};
function TimeSeriesChart({
  data,
  unit,
  title,
  highlightLastValue,
  width,
  height,
  color = '#f00',
  formatXAxis = (v) => v,
  formatYAxis = (v) => v.toString(),
}: Props) {
  const {
    showTooltip,
    tooltipOpen,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<D>();

  useEffect(() => {
    hideTooltip();
    // We want to close tooltip when chart gets updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, width],
        domain: extent(data.map(x)) as [Date, Date],
      }),
    [data, width]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [height, 0],
        domain: [0, Math.max(...data.map(y)) * 1.7],
        nice: true,
      }),
    [data, height]
  );

  const handleTooltip = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
      const { x: localX } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(localX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && x(d1)) {
        d =
          x0.valueOf() - x(d0).valueOf() > x(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }

      const top = yScale(y(d) || 0);
      const left = xScale(x(d));

      if (tooltipTop !== top || tooltipLeft !== left) {
        showTooltip({
          tooltipData: d,
          tooltipLeft: left,
          tooltipTop: top,
        });
      }
    },
    [showTooltip, yScale, xScale, data, tooltipTop, tooltipLeft]
  );

  const xyChartYScale: any = useMemo(
    () => ({ type: 'linear', domain: yScale.domain() }),
    [yScale]
  );
  const lineProps = useMemo(() => ({ stroke: color, strokeWidth: 1 }), [color]);

  return (
    <div className={styles.container}>
      <Legend
        highlightLastValue={highlightLastValue}
        lastValue={`${formatYAxis(data.slice(-1)[0].y || 0)}${unit}`}
        title={title}
        color={color}
      />
      <XYChart
        width={width}
        height={height}
        xScale={xyChartXScale}
        yScale={xyChartYScale}
        margin={margin}
      >
        <AnimatedGrid
          columns={false}
          numTicks={4}
          lineStyle={gridLineProps}
          animationTrajectory="max"
        />
        <AnimatedAxis
          orientation="right"
          left={0}
          numTicks={4}
          hideTicks
          hideAxisLine
          tickClassName={styles.label}
          animationTrajectory="max"
          tickFormat={formatYAxis}
          hideZero
        />
        <AnimatedAreaSeries
          dataKey="Line"
          data={data}
          xAccessor={x}
          yAccessor={y}
          fillOpacity={0.1}
          // @ts-ignore
          lineProps={lineProps}
          fill={color}
          horizOriginX={0}
          offset={0}
        />
      </XYChart>
      <svg width={width} height={height} className={styles.auxSvg}>
        <Bar
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          rx={0}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: 0 }}
              to={{ x: tooltipLeft, y: height }}
              stroke={'white'}
              strokeOpacity={0.3}
              strokeWidth={1}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={5}
              fill={color}
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      <div className={styles.tooltip}>
        <div
          className={cx(styles.tooltipWrapper, { [styles.open]: tooltipOpen })}
        >
          {tooltipOpen && tooltipData && (
            <Spring
              to={{
                tooltipTop: tooltipTop,
                tooltipLeft: tooltipLeft,
              }}
            >
              {(props) => (
                <TooltipWithBounds
                  key={Math.random()}
                  top={props.tooltipTop - 70}
                  left={props.tooltipLeft}
                  className={styles.tooltipContent}
                >
                  <TooltipContent
                    xValue={formatXAxis(`${x(tooltipData)}`)}
                    yValue={`${formatYAxis(y(tooltipData))}${unit}`}
                    title={title}
                    color={color}
                  />
                </TooltipWithBounds>
              )}
            </Spring>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimeSeriesChart;
