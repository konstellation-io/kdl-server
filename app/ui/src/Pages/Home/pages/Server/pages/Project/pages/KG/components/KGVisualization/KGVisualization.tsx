import { CSSTransition, TransitionGroup } from 'react-transition-group';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from 'kwc';
import IconOpen from '@material-ui/icons/ArrowForward';
import KGViz from './KGViz';
import Minimap from '../Minimap/Minimap';
import { ParentSize } from '@visx/responsive';
import cx from 'classnames';
import data from './data';
import styles from './KGVisualization.module.scss';
import { useTooltip } from '@visx/tooltip';
import useZoom from './useZoom';

export enum ResourceType {
  CODE = 'code',
  PAPER = 'paper'
}
export type D = {
  category: string;
  type: ResourceType; 
  name: string;
  score: number;
};

function KGVisualizationWrapper() {
  return (
    <ParentSize className={styles.container} debounceTime={10}>
      {
        ({ width, height }) => (
          width && height && (
            <KGVisualization width={width} height={height} />
          )
        )
      }
    </ParentSize>
  )
}

type Props = {
  width: number;
  height: number;
};
function KGVisualization({ width, height }: Props) {
  const [mockData, setMockData] = useState(data.filter(d => d.score > 0.25));
  
  const {
    showTooltip,
    tooltipOpen,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<D>();
  const minimapRef = useRef<SVGSVGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const { zoomValues, initialZoomValues } = useZoom(svgRef, width, height);
  const viz = useRef<KGViz | null>(null);

  // We want to restart the visualization when resizing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initialize, [width, height]);

  // We want to completelly update the visualization when there are changes
  // that affects the data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, [zoomValues.k, mockData]);

  // We want to update only the minimap when draging the visualization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(updateZoomArea, [zoomValues.x, zoomValues.y]);

  function initialize() {
    if (svgRef.current !== null && gRef.current !== null && minimapRef.current !== null) {
      const vizProps = {
        parent: svgRef.current,
        minimapRef: minimapRef.current,
        data: mockData,
        width,
        height,
        showTooltip,
        hideTooltip,
        initialZoomValues,
        ...zoomValues
      };
      viz.current = new KGViz(gRef.current, vizProps);
    }
  }

  function update() {
    if (viz.current !== null) {
      viz.current.update(zoomValues, mockData);
    } else {
      initialize();
    }
  }
  
  function updateZoomArea() {
    if (viz.current !== null) {
      viz.current.updateZoomArea(zoomValues);
    }
  }
  
  return (
    <>
      <svg ref={svgRef} width={width} height={height} className={styles.svg}>
        <g ref={gRef} transform={`translate(${zoomValues.x}, ${zoomValues.y}) scale(${zoomValues.k})`} />
      </svg>
      <div style={{ position: 'absolute', bottom: 30, left: 50}}>
        <Button label="FILTER" onClick={() => {
          setMockData(mockData.filter(d => d.score <= 0.6));
        }} primary />
      </div>
      <TransitionGroup className={styles.tooltipGroup}>
        <CSSTransition
          key={`${tooltipOpen && tooltipData}`}
          timeout={500}
          classNames={{
            enter: styles.enter,
            exit: styles.exit,
            enterDone: styles.enterDone
          }}
        >
          <>
            {tooltipOpen && tooltipData && (
              <div
                style={{ top: tooltipTop - 2, left: tooltipLeft - 2 }}
                className={ styles.tooltip }
                onMouseLeave={hideTooltip}
                onMouseEnter={() => showTooltip({
                  tooltipData,
                  tooltipLeft,
                  tooltipTop,
                })}
              >
                <div className={styles.tooltipWrapper}>
                  <div className={ styles.tooltipText }>
                    {tooltipData.name}
                  </div>
                  <IconOpen className={cx(styles.tooltipIcon, "icon-regular")} />
                  <div className={styles.tooltipBg}/>
                </div>
              </div>
            )}
          </>
        </CSSTransition>
      </TransitionGroup>
      <Minimap
        minimapRef={minimapRef}
      />
    </>
  )
}

export default KGVisualizationWrapper;
