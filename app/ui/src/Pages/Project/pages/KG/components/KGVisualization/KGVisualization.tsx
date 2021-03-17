import { INNER_R, getInnerDimensions, resourcesViz } from './KGViz';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import DetailsPanel from '../DetailsPanel/DetailsPanel';
import KGViz from './KGViz';
import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';
import ListPanel from '../ListPanel/ListPanel';
import { ParentSize } from '@visx/responsive';
import { RESOURCE_R } from './Resources/Resources';
import ResourceTooltip from './ResourceTooltip/ResourceTooltip';
import SectionList from './SectionList/SectionList';
import cx from 'classnames';
import { kgScore } from 'Graphql/client/cache';
import { select } from 'd3-selection';
import styles from './KGVisualization.module.scss';
import useKGFilters from 'Graphql/client/hooks/useKGFilters';
import { useReactiveVar } from '@apollo/client';
import useTooltip from 'Hooks/useTooltip';

let mouseDown = false;
document.body.onmousedown = function () {
  mouseDown = true;
};
document.body.onmouseup = function () {
  mouseDown = false;
};

export type D = {
  id: string;
  category: string;
  type: KnowledgeGraphItemCat;
  name: string;
  score: number;
  starred: boolean;
};

export interface TopicSections {
  [key: string]: string[];
}

type WrapperProps = {
  data: D[];
  sections: string[];
  selectedResource: string;
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
function KGVisualization({
  width,
  height,
  data,
  sections,
  selectedResource,
}: Props) {
  const scores = useReactiveVar(kgScore);
  const { updateScore } = useKGFilters();

  const [containerLeft, setContainerLeft] = useState(0);
  const [openedPaper, setOpenedPaper] = useState<D | null>(null);
  const [hoveredPaper, setHoveredPaper] = useState<D | null>(null);
  const { tooltipInfo, updateTooltip, hideTooltip } = useTooltip<D>();

  const containerStyles = useMemo(
    () => ({
      left: containerLeft,
    }),
    [containerLeft]
  );

  // const minimapRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const viz = useRef<KGViz | null>(null);

  const [animating, setAnimating] = useState(true);
  const [borderScores, setBorderScores] = useState<[number, number]>([1, 0]);

  const showedData = useMemo(
    () => data.filter((d) => d.score >= scores[1] && d.score <= scores[0]),
    [data, scores]
  );

  const starredResources = useMemo(() => data.filter((d) => d.starred), [data]);

  useEffect(() => {
    if (animating && data) {
      const allScores = data.map((d) => d.score);
      const mn2 = Math.min(...allScores);
      const mx2 = Math.max(...allScores);

      const difMin = mn2;
      const difMax = 1 - mx2;

      // @ts-ignore
      select('body')
        .transition()
        .duration(1000)
        .delay(500)
        .attrTween('fill', () => (t) => {
          updateScore([1 - difMax * t, difMin * t]);
          return t;
        })
        .on('end', () => setAnimating(false));
    }
  }, [data]);

  useEffect(() => {
    const allScores = data.map((d) => d.score);
    const min = Math.min(...allScores);
    const max = Math.max(...allScores);
    if (!animating) {
      updateScore([max, min]);
    }
    setBorderScores([max + 0.01, 0]);
  }, [data, animating]);

  const { outerR } = getInnerDimensions(width, height);

  const SCORE_R = outerR - RESOURCE_R - (INNER_R + RESOURCE_R);
  const scoreUnitPerPx = (scores[0] - scores[1]) / SCORE_R;

  function openResourceDetails(resource: D, left: number) {
    setOpenedPaper(resource);
    centerContainer(left);
    resourcesViz.lockHighlight = resource.name;
    setHoveredPaper(null);
  }
  function closeResourceDetails() {
    setOpenedPaper(null);
    centerContainer(0);
    resourcesViz.lockHighlight = null;
  }

  function getMouseR(e: any) {
    let mouseR = 0;
    if (svgRef.current !== null) {
      const parentRect = svgRef.current.getBoundingClientRect();

      const center = { x: parentRect.width / 2, y: parentRect.height / 2 };
      const mouse = { x: e.pageX - parentRect.x, y: e.pageY - parentRect.y };

      const relativeToCenter = {
        x: Math.abs(mouse.x - center.x),
        y: Math.abs(mouse.y - center.y),
      };

      mouseR = Math.sqrt(relativeToCenter.x ** 2 + relativeToCenter.y ** 2);
    }

    return mouseR;
  }

  function onScroll(e: any) {
    if (canvasRef.current !== null) {
      let mouseR = getMouseR(e);

      const [maxScore, minScore] = borderScores;

      const mouseInScale = mouseR - (INNER_R + RESOURCE_R);
      const mousePivot = mouseInScale / SCORE_R;

      const [max, min] = scores;
      const diff = max - min;
      const rev = 1 / diff;

      const scoreFactorMin = 1 - mousePivot;
      const scoreFactorMax = mousePivot;

      // console.log('e.deltaY', e.deltaY);
      // const deltaYNormalized = -(e.deltaY / height) / 10;
      // console.log('deltaYNormalized', deltaYNormalized);
      // console.log('scoreFactorMin', scoreFactorMin);
      // console.log('rev', rev);

      const dScore: number = -e.deltaY / (500 * rev); // 50 000
      // const dScore: number = deltaYNormalized; // 50 000

      const newMin = Math.min(
        max,
        Math.max(minScore, min + dScore * scoreFactorMin)
      );
      const newMax = Math.max(
        newMin + 0.0001,
        Math.min(maxScore, max - dScore * scoreFactorMax)
      );

      updateScore([newMax, newMin]);
      setHoveredPaper(null);
    }
  }

  const draggingOrig = useRef(0);
  const draggingPivot = useRef([1, 0]);
  function dragStart(e: any) {
    draggingOrig.current = getMouseR(e);
    draggingPivot.current = [...scores];
  }

  function drag(e: any) {
    if (mouseDown) {
      const actMouseR = getMouseR(e);
      const dR = actMouseR - draggingOrig.current;
      const dScore = dR * scoreUnitPerPx;

      const [max, min] = draggingPivot.current;
      const sep = max - min;

      let newMax = max + dScore;

      const [limitMax] = borderScores;

      newMax = Math.min(limitMax, newMax);
      const newMin = newMax - sep;

      updateScore([newMax, newMin]);
    }
  }

  function centerContainer(left: number) {
    setContainerLeft(left);
  }

  // We want to restart the visualization when resizing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initialize, [width, height]);

  // We want to completelly update the visualization when there are changes
  // that affects the data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, [data]);

  useEffect(updateScores, [scores]);

  useEffect(updateSelectedResource, [selectedResource]);

  function initialize() {
    if (
      containerRef.current !== null &&
      svgRef.current !== null &&
      gRef.current !== null &&
      canvasRef.current !== null
    ) {
      const vizProps = {
        container: containerRef.current,
        parent: svgRef.current,
        canvas: canvasRef.current,
        // minimapRef: minimapRef.current,
        data,
        width,
        height,
        tooltipOpen: tooltipInfo.open,
        updateTooltip,
        hideTooltip,
        onResourceSelection: openResourceDetails,
        centerText: selectedResource,
        onHoverResource: setHoveredPaper,
        onScroll,
        scores,
      };
      viz.current = new KGViz(gRef.current, vizProps);
    }
  }

  function update() {
    if (data) {
      if (viz.current !== null) {
        viz.current.update(data, scores);
      } else {
        initialize();
      }
    }
  }

  function updateScores() {
    if (data) {
      if (viz.current !== null) {
        viz.current.updateScores(data, scores);
      } else {
        initialize();
      }
    }
  }

  function updateSelectedResource() {
    if (viz.current !== null) {
      viz.current.updateCenterText(selectedResource);
    }
  }

  return (
    <div
      className={styles.container}
      style={containerStyles}
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
      </div>
      <div className={styles.sectionTags}>
        {sections.map((section) => (
          <SectionList section={section} key={section} />
        ))}
      </div>
      <div className={styles.staticTooltip}>
        <ResourceTooltip resource={hoveredPaper} />
      </div>
      <div
        className={cx(styles.shield, { [styles.show]: openedPaper !== null })}
        onClick={closeResourceDetails}
      />
      <div className={styles.listPanel}>
        <ListPanel
          resources={showedData}
          starredResources={starredResources}
          scores={scores}
          onResourceClick={openResourceDetails}
        />
        <DetailsPanel resource={openedPaper} onClose={closeResourceDetails} />
      </div>
      {/* <Minimap
        minimapRef={minimapRef}
        zoomValues={zoomValues}
        initialZoomValues={initialZoomValues}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      /> */}
    </div>
  );
}

export default KGVisualizationWrapper;
