import KGViz, { D, getVizDimensions, INNER_R } from './Viz/KGViz';
import React, {
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEvent,
} from 'react';

import useKGVizScores from './useKGVizScores';
import { GetKnowledgeGraph_knowledgeGraph_items } from 'Graphql/queries/types/GetKnowledgeGraph';
import { KGItem } from '../../KG';
import { ParentSize } from '@visx/responsive';
import { RESOURCE_R } from './Viz/Resources';
import ResourceDetails from '../ResourceDetails/ResourceDetails';
import ResourceLists from '../ResourceLists/ResourceLists';
import ResourceTooltip from './ResourceTooltip/ResourceTooltip';
import cx from 'classnames';
import styles from './KGVisualizationWrapper.module.scss';
import { buildD } from '../../KGUtils';

let mouseDown = false;

type WrapperProps = {
  data: KGItem[];
};
function KGVisualizationWrapper(props: WrapperProps) {
  return (
    <ParentSize className={styles.container} debounceTime={10}>
      {({ width, height }) =>
        width &&
        height && <KGVisualization width={width} height={height} {...props} />
      }
    </ParentSize>
  );
}

type Props = {
  width: number;
  height: number;
} & WrapperProps;
function KGVisualization({ width, height, data }: Props) {
  const [left, setLeft] = useState(0);
  const [
    openedPaper,
    setOpenedPaper,
  ] = useState<GetKnowledgeGraph_knowledgeGraph_items | null>(null);
  const [hoveredPaper, setHoveredPaper] = useState<D | null>(null);

  const vizData: D[] = useMemo(() => data.map(buildD), [data]);

  const { scores, zoomScore, dragScore } = useKGVizScores(vizData);

  const containerLeftStyle = useMemo(() => ({ left }), [left]);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labelsSvgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const viz = useRef<KGViz | null>(null);

  const starredResources = useMemo(() => data.filter((d) => d.starred), [data]);
  const displayedData = useMemo(
    () => data.filter((d) => d.score >= scores[1] && d.score <= scores[0]),
    [data, scores]
  );

  useEffect(() => {
    document.body.onmousedown = () => (mouseDown = true);
    document.body.onmouseup = () => (mouseDown = false);

    return () => {
      document.body.onmousedown = null;
      document.body.onmouseup = null;
    };
  }, []);

  // Updates opened paper if its data has been updated
  useEffect(() => {
    if (openedPaper) {
      setOpenedPaper(data.find((d) => d.id === openedPaper.id) || null);
    }
  }, [data, openedPaper]);

  const { outerR, center } = getVizDimensions(width, height);

  const SCORE_R = outerR - RESOURCE_R - INNER_R;
  const scoreUnitPerPx = (scores[0] - scores[1]) / SCORE_R;

  function openResourceDetails(id: string, name: string) {
    if (viz.current !== null) {
      const { x } = viz.current.getResourceCoords(id);

      setOpenedPaper(data.find((r) => r.id === id) || null);
      setLeft(-x / 2);
      viz.current.resources.highlightResource(name);
      setHoveredPaper(null);
    }
  }

  function closeResourceDetails() {
    setOpenedPaper(null);
    setLeft(0);
    viz.current && viz.current.resources.unhighlightResource();
  }

  function getMouseR(e: WheelEvent | MouseEvent) {
    let mouseR = 0;
    if (svgRef.current !== null) {
      const parentRect = svgRef.current.getBoundingClientRect();
      const mouse = { x: e.pageX - parentRect.x, y: e.pageY - parentRect.y };

      const relativeToCenter = {
        x: Math.abs(mouse.x - center.x),
        y: Math.abs(mouse.y - center.y),
      };

      mouseR = Math.sqrt(relativeToCenter.x ** 2 + relativeToCenter.y ** 2);
    }

    return mouseR;
  }

  function onScroll(e: WheelEvent) {
    if (canvasRef.current !== null) {
      let mouseR = getMouseR(e);

      const mouseInScale = mouseR - INNER_R;
      const mousePivot = mouseInScale / SCORE_R;

      zoomScore(-e.deltaY, mousePivot);
      setHoveredPaper(null);
      viz.current && viz.current.resources.hoverResource(null);
    }
  }

  const draggingOrig = useRef(0);
  const draggingPivot = useRef<[number, number]>([1, 0]);
  function dragStart(e: MouseEvent) {
    draggingOrig.current = getMouseR(e);
    draggingPivot.current = [...scores];
  }

  function drag(e: MouseEvent) {
    if (!mouseDown) return;

    const actMouseR = getMouseR(e);
    const dR = actMouseR - draggingOrig.current;
    const dScore = dR * scoreUnitPerPx;

    dragScore(dScore, draggingPivot.current);
  }

  // We want to restart the visualization when resizing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initialize, [width, height]);

  // We want to completely update the visualization when there are changes
  // that affects the data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, [vizData, scores]);

  function initialize() {
    if (
      containerRef.current !== null &&
      labelsSvgRef.current !== null &&
      gRef.current !== null &&
      canvasRef.current !== null
    ) {
      const vizProps = {
        container: containerRef.current,
        canvas: canvasRef.current,
        labelsSvg: labelsSvgRef.current,
        data: vizData,
        width,
        height,
        onResourceSelection: openResourceDetails,
        onHoverResource: setHoveredPaper,
        scores,
      };
      viz.current = new KGViz(gRef.current, vizProps);
    }
  }

  function update() {
    if (viz.current === null) initialize();
    else viz.current.update(vizData, scores);
  }

  return (
    <div
      className={styles.container}
      style={containerLeftStyle}
      ref={containerRef}
    >
      <div>
        <svg className={styles.svg} ref={svgRef} width={width} height={height}>
          <g ref={gRef} />
        </svg>
        <canvas
          className={styles.canvas}
          ref={canvasRef}
          width={width}
          height={height}
          onWheel={onScroll}
          onMouseDown={dragStart}
          onMouseMove={drag}
        />
        <svg
          className={styles.labelsSvg}
          ref={labelsSvgRef}
          width={width}
          height={height}
        />
      </div>
      <div className={styles.staticTooltip}>
        <ResourceTooltip resource={hoveredPaper} />
      </div>
      <div
        className={cx(styles.shield, { [styles.show]: openedPaper !== null })}
        onClick={closeResourceDetails}
      />
      <div className={styles.panels}>
        <div className={styles.listPanel}>
          <ResourceLists
            resources={displayedData}
            starredResources={starredResources}
            scores={scores}
            onResourceClick={openResourceDetails}
            hoverResource={viz.current && viz.current.resources.hoverResource}
          />
        </div>
        <div
          className={cx(styles.detailsPanel, {
            [styles.opened]: openedPaper !== null,
          })}
        >
          <ResourceDetails
            resource={openedPaper}
            onClose={closeResourceDetails}
          />
        </div>
      </div>
    </div>
  );
}

export default KGVisualizationWrapper;
