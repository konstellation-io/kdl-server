import React, { useEffect, useRef, useState } from 'react';

import FilterGlow from './FilterGlow/FilterGlow';
import KGViz from './KGViz';
import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';
import Minimap from '../Minimap/Minimap';
import { ParentSize } from '@visx/responsive';
import SectionList from './SectionList/SectionList';
import Tooltip from './Tooltip';
import styles from './KGVisualization.module.scss';
import useTextTooltip from 'Hooks/useTextTooltip';
import useZoom from './useZoom';

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
  const { tooltipInfo, updateTooltip, hideTooltip } = useTextTooltip();

  const minimapRef = useRef<SVGSVGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const { zoomValues, initialZoomValues, zoomIn, zoomOut } = useZoom({
    svgRef,
    width,
    height,
  });
  const viz = useRef<KGViz | null>(null);

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
        tooltipOpen: tooltipInfo.open,
        updateTooltip,
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
      <Tooltip {...tooltipInfo} />
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
