import { BaseType, Selection, select } from 'd3-selection';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { zoom, zoomIdentity } from 'd3-zoom';

import { OUTER_R } from './KGViz';

export const PADDING = 0.15;

const MIN_ZOOM = 0.1; // x0.1
const MAX_ZOOM = 50;  // x50

const TARGET_OUTER_R_PERC = (1 - 2 * PADDING) / 2;

export type ZoomValues = {
  x: number;
  y: number;
  k: number;
};

type UseZoom = {
  zoomValues: ZoomValues | null;
  initialZoomValues: ZoomValues
};

const useZoom: (
  svgRef: MutableRefObject<Element | null>,
  width: number,
  height: number
) => UseZoom = (svgRef, width, height) => {
  const targetOuterR = Math.min(width * TARGET_OUTER_R_PERC, height * TARGET_OUTER_R_PERC);
  const scaleToTarget = targetOuterR / OUTER_R;

  const [ zoomValues, setTx ] = useState<ZoomValues | null>(null);
  const initialZoomValues = useRef<ZoomValues>({ x: 0, y: 0, k: 0 });

  useEffect(() => {
    // Initialize the element to match the screen and be centered
    initialZoomValues.current = {
      x: width / 2 * (1 - scaleToTarget),
      y: height / 2 * (1 - scaleToTarget),
      k: scaleToTarget
    };

    // Sets zoom transform to scale chart properly
    const tx = zoomIdentity
      .translate(
        initialZoomValues.current.x,
        initialZoomValues.current.y
      )
      .scale(initialZoomValues.current.k);

    const zm = zoom()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on('zoom', (event) => setTx(event.transform));

    const selection = select(svgRef.current);

    (selection as Selection<Element, unknown, BaseType, unknown>)
      .call(zm)
      .call(zm.transform, tx);

    return () => {
      selection.on('zoom', null);
    }
  }, [svgRef, width, height, scaleToTarget]);

  return { zoomValues, initialZoomValues: initialZoomValues.current };
}

export default useZoom;
