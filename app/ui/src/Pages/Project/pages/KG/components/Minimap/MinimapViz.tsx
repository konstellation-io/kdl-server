import { BaseType, EnterElement, Selection, select } from 'd3-selection';
import { Coord, GroupD } from '../../KGUtils';

import { N_GUIDES } from '../KGVisualization/KGViz';
import { ZoomValues } from '../KGVisualization/useZoom';
import { range } from 'd3-array';
import { scaleLinear } from '@visx/scale';
import styles from './Minimap.module.scss';

const RESOURCE_R = 18;

const MINIMAP_OUTER_R = 0.4;
const OUTER_R = 370;
const INNER_R = 53.5;

const COLOR_SCALE_COLORS = ['#00303B', '#D6FFFF'];
const colorScale = scaleLinear({
  domain: [1, 10],
  range: COLOR_SCALE_COLORS,
});

type Props = {
  areaWidth: number;
  areaHeight: number;
  x: number;
  y: number;
  k: number;
  initialZoomValues: ZoomValues;
};
class MinimapViz {
  props: Props;
  wrapper: Selection<SVGSVGElement, unknown, null, undefined>;
  zoomArea: Selection<SVGRectElement, unknown, null, undefined> | null;
  center: Coord;
  container: any;
  zoom: ZoomValues;
  data: GroupD[] = [];
  minimapScale: number = 0;

  constructor(wrapper: SVGSVGElement, props: Props) {
    this.wrapper = select(wrapper);
    const width = +this.wrapper.attr('width');
    const height = +this.wrapper.attr('height');

    this.minimapScale = (MINIMAP_OUTER_R * height) / OUTER_R;
    this.zoomArea = null;
    this.zoom = { x: 0, y: 0, k: 1 };
    this.props = props;
    this.center = { x: width / 2, y: height / 2 };
    this.cleanup();
  }

  cleanup = () => {
    this.wrapper.selectAll('*').remove();
  };

  resize = ({ width, height }: { width: number; height: number }) => {
    this.cleanup();
    this.center = { x: width / 2, y: height / 2 };
    this.minimapScale = (MINIMAP_OUTER_R * height) / OUTER_R;

    this.initialize(this.data);
    this.update(this.data, this.zoom);
  };

  initialize = (data: GroupD[]) => {
    this.data = data;

    const {
      wrapper,
      center,
      resources,
      minimapScale,
      props: { areaWidth, areaHeight },
    } = this;

    // Add structural elements
    // Container
    this.container = wrapper
      .append('g')
      .classed(styles.container, true)
      .attr(
        'transform',
        `translate(${center.x}, ${center.y}) scale(${minimapScale})`
      );

    // Circle
    this.container
      .append('circle')
      .classed(styles.circle, true)
      .attr('r', OUTER_R);

    // Guides
    const guides = this.container.append('g');
    range(1, N_GUIDES + 1).forEach((guide) =>
      guides
        .append('circle')
        .classed(styles.guide, true)
        .attr('r', INNER_R + ((OUTER_R - INNER_R) * guide) / 3)
    );

    // Data
    const resourcesWrapper = this.container
      .append('g')
      .classed(styles.resourcesWrapper, true);

    const newResources = resourcesWrapper
      .selectAll(`.${styles.resourceG}`)
      .data(data)
      .enter();

    // Zoom Area
    this.zoomArea = wrapper
      .append('rect')
      .classed(styles.zoomArea, true)
      .attr('width', areaWidth)
      .attr('height', areaHeight);

    resources.create(newResources);
  };

  update = (data: GroupD[], zoom: ZoomValues) => {
    this.data = data;

    const {
      container,
      resources,
      zoomArea,
      center,
      minimapScale,
      props: { areaWidth, areaHeight },
    } = this;
    this.zoom = zoom;

    // Data
    const allResources = container
      .select(`.${styles.resourcesWrapper}`)
      .selectAll(`.${styles.resourceG}`)
      .data(data, (d: GroupD) => `${d.x}${d.y}`);
    const newResources = allResources.enter();
    const oldResources = allResources.exit();

    // Zoom area
    const phaseFactor = (1 - zoom.k) / 2;
    const phaseDx = areaWidth * phaseFactor;
    const phaseDy = areaHeight * phaseFactor;

    const dk = minimapScale * (1 / zoom.k);
    const dx =
      center.x -
      (areaWidth * dk) / 2 -
      ((zoom.x - phaseDx) * minimapScale) / zoom.k;
    const dy =
      center.y -
      (areaHeight * dk) / 2 -
      ((zoom.y - phaseDy) * minimapScale) / zoom.k;

    zoomArea &&
      zoomArea
        .attr('x', dx)
        .attr('y', dy)
        .attr('width', areaWidth * dk)
        .attr('height', areaHeight * dk);

    resources.create(newResources);
    resources.remove(oldResources);
    resources.update(allResources);
  };

  resources = {
    create: (container: Selection<EnterElement, GroupD, BaseType, unknown>) => {
      const resourcesG = container
        .append('g')
        .classed(styles.resourceG, true)
        .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

      resourcesG
        .append('circle')
        .classed(styles.resource, true)
        .classed(styles.resourceGroup, (d: GroupD) => d.elements.length > 1)
        .classed(styles.resourceNode, (d: GroupD) => d.elements.length === 1)
        .attr('fill', (d: GroupD) => colorScale(d.elements.length))
        .attr('r', RESOURCE_R);
    },
    update: (container: Selection<BaseType, GroupD, BaseType, unknown>) => {
      container.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    },
    remove: (container: Selection<BaseType, unknown, BaseType, unknown>) => {
      container.remove();
    },
  };
}

export default MinimapViz;
