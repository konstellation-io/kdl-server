import React, { MutableRefObject, useEffect, useState } from 'react';

import AnimateHeight from 'react-animate-height';
import MinimapBar from './MinimapBar';
import { ZoomValues } from '../KGVisualization/useZoom';
import { minimapViz } from '../KGVisualization/KGViz';
import styles from './Minimap.module.scss';
import useBoolState from 'Hooks/useBoolState';

export const MINIMAP_WIDTH = 202;
export const MINIMAP_HEIGHT = 162;

const defaultDimensions = {
  width: MINIMAP_WIDTH,
  height: MINIMAP_HEIGHT
};

const expandedDimensions = {
  width: MINIMAP_WIDTH * 2,
  height: MINIMAP_HEIGHT * 2
};

interface Props {
  minimapRef: MutableRefObject<SVGSVGElement | null>;
  zoomValues: ZoomValues | null;
  initialZoomValues: ZoomValues;
  zoomIn: () => void;
  zoomOut: () => void;
}

function Minimap({ minimapRef, initialZoomValues, zoomValues, zoomIn, zoomOut }: Props) {
  const [minimapDimensions, setMinimapDimensions] = useState(defaultDimensions);

  const {
    value: expanded,
    toggle: toggleExpanded,
    deactivate: shrink
  } = useBoolState(false);
  
  const {
    value: minimapVisible,
    toggle: toggleMinimap
  } = useBoolState(true);

  useEffect(() => {
    setMinimapDimensions(expanded ? expandedDimensions : defaultDimensions);
  }, [expanded]);

  // Wait for resite animation to rescale the minimap chart
  useEffect(() => {
    const timeout = window.setTimeout(
      () => minimapViz?.resize(minimapDimensions),
      400
    );

    return () => clearTimeout(timeout);
  }, [minimapDimensions]);

  // Hiding the minimap also shrinks it
  useEffect(() => {
    if (!minimapVisible) {
      shrink();
    }
  }, [minimapVisible, shrink]);

  const actZoom = zoomValues?.k || 0;
  const zoomValue = actZoom + (1 - initialZoomValues.k);

  return (
    <div className={ styles.container }>
      <AnimateHeight height={ minimapVisible ? 'auto' : 0 } duration={300}>
        <svg
          ref={minimapRef}
          {...minimapDimensions}
          className={styles.minimap}
        />
      </AnimateHeight>
      <MinimapBar
        minimapVisible={minimapVisible}
        toggleMinimap={toggleMinimap}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        zoomValue={zoomValue}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      />
    </div>
  )
}

export default Minimap;
