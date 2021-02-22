import React, { useEffect, useRef, useState } from 'react';

import FilterGlow from './FilterGlow/FilterGlow';
import IconOpen from '@material-ui/icons/ArrowForward';
import KGViz from './KGViz';
import Minimap from '../Minimap/Minimap';
import { ParentSize } from '@visx/responsive';
import SectionList from './SectionList/SectionList';
import cx from 'classnames';
import styles from './KGVisualization.module.scss';
import { useTooltip } from '@visx/tooltip';
import useZoom from './useZoom';
import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';

export type D = {
  category: string;
  type: KnowledgeGraphItemCat;
  name: string;
  score: number;
};

export interface TopicSections {
  [key: string]: string[];
}

type WrapperProps = {
  data: D[];
  sections: TopicSections;
  selectedResource: string;
  onResourceSelection: (name: string) => void;
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
  onResourceSelection,
}: Props) {
  const [hoveredPaper, setHoveredPaper] = useState<string | null>(null);
  const [tooltipActive, setTooltipActive] = useState<{
    data: D;
    left: number;
    top: number;
  }>({
    data: {
      category: '',
      type: KnowledgeGraphItemCat.Code,
      name: '',
      score: 0,
    },
    left: 0,
    top: 0,
  });
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
  const { zoomValues, initialZoomValues, zoomIn, zoomOut } = useZoom({
    svgRef,
    width,
    height,
  });
  const viz = useRef<KGViz | null>(null);

  // TODO: Do not use useTooltip from Visx
  // useTooltip removes tooltip location and data when hiding it instead of just changing the tooltipOpen
  // state. updateTooltip cannot change only one value so I have to track previous tooltip data in order to
  // hide it mainitaining previous data.
  useEffect(() => {
    if (tooltipData) {
      setTooltipActive({
        data: tooltipData,
        left: tooltipLeft,
        top: tooltipTop,
      });
    }
  }, [tooltipData, tooltipLeft, tooltipTop]);

  // We want to restart the visualization when resizing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(initialize, [width, height]);

  // We want to completelly update the visualization when there are changes
  // that affects the data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, [zoomValues?.k, data]);

  useEffect(updateSelectedResource, [selectedResource]);

  // We want to update only the minimap when draging the visualization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(updateZoomArea, [zoomValues?.x, zoomValues?.y]);

  useEffect(() => {
    viz.current !== null && viz.current.highlightResource(hoveredPaper);
  }, [hoveredPaper]);

  function initialize() {
    if (
      svgRef.current !== null &&
      gRef.current !== null &&
      minimapRef.current !== null &&
      zoomValues !== null
    ) {
      const vizProps = {
        parent: svgRef.current,
        minimapRef: minimapRef.current,
        data,
        width,
        height,
        tooltipOpen,
        showTooltip,
        hideTooltip,
        initialZoomValues,
        onResourceSelection,
        centerText: selectedResource,
        ...zoomValues,
      };
      viz.current = new KGViz(gRef.current, vizProps);
    }
  }

  function update() {
    if (viz.current !== null && zoomValues !== null) {
      viz.current.update(zoomValues, data);
    } else {
      initialize();
    }
  }

  function updateSelectedResource() {
    if (viz.current !== null) {
      viz.current.updateCenterText(selectedResource);
    }
  }

  function updateZoomArea() {
    if (viz.current !== null && zoomValues !== null) {
      viz.current.updateZoomArea(zoomValues);
    }
  }

  return (
    <>
      <svg ref={svgRef} width={width} height={height} className={styles.svg}>
        <g
          ref={gRef}
          transform={`translate(${zoomValues?.x || 0}, ${
            zoomValues?.y || 0
          }) scale(${zoomValues?.k || 1})`}
        />
        <FilterGlow />
      </svg>
      <div className={styles.sectionTags}>
        {Object.keys(sections).map((section) => (
          <SectionList
            section={section}
            key={section}
            names={sections[section]}
            setHoveredPaper={setHoveredPaper}
            onResourceSelection={onResourceSelection}
          />
        ))}
      </div>
      <div
        style={{ top: tooltipActive.top - 2, left: tooltipActive.left - 2 }}
        className={cx(styles.tooltip, { [styles.open]: tooltipOpen })}
      >
        <div className={styles.tooltipWrapper}>
          <div className={styles.tooltipText}>{tooltipActive.data.name}</div>
          <IconOpen className={cx(styles.tooltipIcon, 'icon-regular')} />
          <div className={styles.tooltipBg} />
        </div>
      </div>
      <Minimap
        minimapRef={minimapRef}
        zoomValues={zoomValues}
        initialZoomValues={initialZoomValues}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
      />
    </>
  );
}

export default KGVisualizationWrapper;
