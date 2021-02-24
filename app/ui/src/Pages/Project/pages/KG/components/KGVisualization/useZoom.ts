import { BaseType, Selection, select } from 'd3-selection';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { zoom, zoomIdentity } from 'd3-zoom';

import { OUTER_R } from './KGViz';

export const PADDING = 0.15;

const MIN_ZOOM = 0.1; // x0.1
const MAX_ZOOM = 50; // x50

const TARGET_OUTER_R_PERC = (1 - 2 * PADDING) / 2;

export type ZoomValues = {
  x: number;
  y: number;
  k: number;
};

type Params = {
  svgRef: MutableRefObject<Element | null>;
  width: number;
  height: number;
  zoomStep?: number;
};
type UseZoom = {
  zoomValues: ZoomValues | null;
  initialZoomValues: ZoomValues;
  zoomIn: () => void;
  zoomOut: () => void;
  reallocateZoom: (dx: number, dy: number) => void;
};

const zm = zoom();

const useZoom: (p: Params) => UseZoom = ({
  svgRef,
  width,
  height,
  zoomStep = 0.25,
}) => {
  const targetOuterR = Math.min(
    width * TARGET_OUTER_R_PERC,
    height * TARGET_OUTER_R_PERC
  );
  const scaleToTarget = targetOuterR / OUTER_R;

  const [zoomValues, setTx] = useState<ZoomValues | null>(null);
  const initialZoomValues = useRef<ZoomValues>({ x: 0, y: 0, k: 0 });

  useEffect(() => {
    // Initialize the element to match the screen and be centered
    initialZoomValues.current = {
      x: (width / 2) * (1 - scaleToTarget),
      y: (height / 2) * (1 - scaleToTarget),
      k: scaleToTarget,
    };

    // Sets zoom transform to scale chart properly
    const tx = zoomIdentity
      .translate(initialZoomValues.current.x, initialZoomValues.current.y)
      .scale(initialZoomValues.current.k);

    zm.scaleExtent([MIN_ZOOM, MAX_ZOOM]).on('zoom', (event) =>
      setTx(event.transform)
    );

    const selection = select(svgRef.current);

    (selection as Selection<Element, unknown, BaseType, unknown>)
      .call(zm)
      .call(zm.transform, tx);

    return () => {
      selection.on('zoom', null);
    };
  }, [svgRef, width, height, scaleToTarget]);

  function updateZoom(multiplier: number) {
    if (zoomValues) {
      const dk = zoomValues.k * multiplier;
      const newK = zoomValues.k + dk;

      if (newK < MIN_ZOOM || newK > MAX_ZOOM) return;

      const tx = zoomIdentity
        .translate(
          zoomValues.x - (width / 2) * dk,
          zoomValues.y - (height / 2) * dk
        )
        .scale(newK);

      const selection = select(svgRef.current);
      (selection as Selection<Element, unknown, BaseType, unknown>).call(
        zm.transform,
        tx
      );
    }
  }
  
  function reallocateZoom(dx: number, dy: number) {
    if (zoomValues) {
      const centerX = (width / 2) * (1 - zoomValues.k);
      const centerY = (height / 2) * (1 - zoomValues.k);

      const tx = zoomIdentity
        .translate(
          centerX - dx,
          centerY - dy
        )
        .scale(zoomValues.k);

      const selection = select(svgRef.current);
      (selection as Selection<Element, unknown, BaseType, unknown>).call(
        zm.transform,
        tx
      );
    }
  }

  const zoomIn = () => updateZoom(zoomStep);
  const zoomOut = () => updateZoom(-zoomStep);

  return {
    zoomValues,
    initialZoomValues: initialZoomValues.current,
    zoomIn,
    zoomOut,
    reallocateZoom
  };
};

export default useZoom;
