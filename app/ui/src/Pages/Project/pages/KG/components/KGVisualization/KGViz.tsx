import {
  BaseType,
  Local,
  Selection,
  local,
  select,
} from 'd3-selection';
import { Coord, GroupD, getHash, groupData } from '../../KGUtils';
import Resources, { RESOURCE_R } from './Resources/Resources';
import { scaleBand, scaleLinear } from '@visx/scale';

import { D } from './KGVisualization';
import MinimapViz from '../Minimap/MinimapViz';
import Sections from './Sections/Sections';
import { UpdateTooltip } from 'Hooks/useTextTooltip';
import { ZoomValues } from './useZoom';
import { px } from 'Utils/d3';
import { range } from 'd3-array';
import styles from './KGVisualization.module.scss';

export const PADDING = 0.15;
export const OUTER_R = 370;

const MIN_SCORE = 0;
const MAX_SCORE = 1;

const TOOLTIP_WIDTH = 300;
const INNER_R = 53.5;
const GUIDE_STROKE = 1;
const AXIS_PADDING = 8;
const AXIS_FONT_SIZE = 12;

export const N_GUIDES = 2;

export let minimapViz: MinimapViz;

const section = (d: D) => d.category;

export type CoordData = {
  category: string;
  score: number;
  name?: string;
};
export type CoordOptions = {
  jittered?: boolean;
  offset?: number;
  bisector?: boolean;
};
export type CoordOut = {
  x: number;
  y: number;
  angle: number;
};

type Props = {
  width: number;
  parent: SVGSVGElement;
  data: D[];
  height: number;
  updateTooltip: (p: UpdateTooltip) => void;
  hideTooltip: () => void;
  minimapRef: SVGSVGElement;
  tooltipOpen: boolean;
  x: number;
  y: number;
  k: number;
  initialZoomValues: ZoomValues;
  onResourceSelection: (name: string) => void;
  centerText: string;
};

class KGViz {
  props: Props;
  wrapper: Selection<SVGGElement, unknown, null, undefined>;
  mainG: Selection<SVGGElement, unknown, null, undefined>;
  center: Coord;
  rScale = scaleLinear<number>();
  rDomain: [number, number] = [MAX_SCORE, MIN_SCORE];
  sectionScale = scaleBand();
  sectionDomain: string[];
  groupedData: GroupD[];
  minimap: MinimapViz;
  sectionOrientation: Local<string>;
  resources: Resources;
  sections: Sections;
  size: {
    innerWidth: number;
    innerHeight: number;
    guideStroke: number;
    bubbleCollision: number;
    tooltipWidth: number;
    axisPadding: number;
    axisFontSize: number;
  };

  constructor(wrapper: SVGGElement, props: Props) {
    this.wrapper = select(wrapper);
    this.mainG = select(wrapper);
    this.props = props;
    this.groupedData = [];
    this.sectionDomain = [];

    const innerWidth = (1 - 2 * PADDING) * props.width;
    const innerHeight = (1 - 2 * PADDING) * props.height;
    this.center = { x: props.width / 2, y: props.height / 2 };
    this.size = {
      innerWidth,
      innerHeight,
      guideStroke: 0,
      bubbleCollision: 0,
      tooltipWidth: 0,
      axisPadding: 0,
      axisFontSize: 0,
    };

    this.rScale = scaleLinear({
      range: [INNER_R + RESOURCE_R, OUTER_R - RESOURCE_R],
      domain: this.rDomain,
    });
    this.sectionScale = scaleBand({
      range: [0, 360],
      padding: 0,
    });

    this.minimap = new MinimapViz(props.minimapRef, {
      areaWidth: props.width,
      areaHeight: props.height,
      x: props.x,
      y: props.y,
      k: props.k,
      initialZoomValues: props.initialZoomValues,
    });
    minimapViz = this.minimap;
    
    this.sectionOrientation = local<string>();

    this.resources = new Resources(
      this.onShowTooltip,
      this.onHideTooltip,
      this.wrapper,
      this.props.onResourceSelection
    );

    this.sections = new Sections(
      this.wrapper
    );

    this.updateSizes();
    this.cleanup();
    this.initialize();
  }

  cleanup = () => {
    this.wrapper.selectAll('*').remove();
  };

  updateScalesAndData = (data: D[]) => {
    this.sectionDomain = Array.from(new Set(data.map(section)));
    this.sectionScale.domain(this.sectionDomain);

    this.groupedData = groupData(data, this.coord, this.elementsCollide);
  };

  initialize = () => {
    this.updateScalesAndData(this.props.data);

    this.minimap.initialize(this.groupedData);

    const {
      sections,
      wrapper,
      center,
      groupedData,
      sectionDomain,
      coord,
      rDomain,
      resources,
      size: { guideStroke, axisPadding, axisFontSize },
      props: { centerText },
    } = this;

    // Add structural elements
    // center wrapper
    this.mainG = wrapper
      .append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);

    const { mainG } = this;

    // Guides
    const guides = mainG.append('g');
    range(1, N_GUIDES + 1).forEach((guide) =>
      guides
        .append('circle')
        .classed(styles.guide, true)
        .attr('r', INNER_R + ((OUTER_R - INNER_R) * guide) / 3)
        .attr('stroke-width', guideStroke)
    );

    // Sections 
    sections.init(mainG, sectionDomain, coord, rDomain);

    // InnerCircle
    const innerCircle = mainG.append('g');
    innerCircle
      .append('circle')
      .classed(styles.innerCircle, true)
      .attr('r', INNER_R);

    innerCircle
      .append('foreignObject')
      .attr('x', -INNER_R)
      .attr('y', -INNER_R)
      .attr('width', 2 * INNER_R)
      .attr('height', 2 * INNER_R)
      .append('xhtml:div')
      .classed(styles.innerCircleText, true)
      .html(centerText);

    // OuterCircle
    mainG.append('circle').classed(styles.outerCircle, true).attr('r', OUTER_R);

    // Radius axis
    const [maxR, minR] = rDomain.map(v => v * 100);
    const axis = mainG
      .append('g')
      .classed(styles.axis, true)
      .attr('transform', `translate(${INNER_R + 1}, 0)`);
    axis.append('text').text(`${Math.round(maxR)}%`);
    axis
      .append('text')
      .attr('x', (OUTER_R - INNER_R) / 3)
      .text(`${Math.round(minR + (maxR-minR) * 2 / 3)}%`);
    axis
      .append('text')
      .attr('x', ((OUTER_R - INNER_R) * 2) / 3)
      .text(`${Math.round(minR + (maxR-minR) / 3)}%`);
    axis
      .append('text')
      .attr('x', OUTER_R - INNER_R)
      .text(`${Math.round(minR)}%`);
    axis
      .selectAll('text')
      .attr('dx', axisPadding)
      .attr('dy', -axisPadding)
      .style('font-size', px(axisFontSize));

    // Data elements
    resources.init(mainG, groupedData);
  };

  highlightResource = (resourceName: string | null) => {
    this.resources.highlightResource(resourceName);
  };

  updateCenterText = (newCenterText: string) => {
    const { mainG } = this;

    mainG.select(`.${styles.innerCircleText}`).html(newCenterText);
  };

  updateZoomArea = (zoomValues: ZoomValues) => {
    const { sections, minimap, groupedData, resetTooltip } = this;

    minimap.update(groupedData, zoomValues);

    resetTooltip();
    sections.positionSectionBoxes();
  };

  update = (zoomValues: ZoomValues, data: D[]) => {
    this.props.k = zoomValues.k;
    this.updateSizes();

    this.updateScalesAndData(data);

    this.minimap.update(this.groupedData, zoomValues);

    const {
      sections,
      mainG,
      groupedData,
      resetTooltip,
      sectionDomain,
      resources,
      coord,
      rDomain,
      size: { guideStroke, axisPadding, axisFontSize },
    } = this;

    resetTooltip();

    // Guides
    mainG.selectAll(`.${styles.guide}`).attr('stroke-width', guideStroke);

    // Sections
    sections.performUpdate(sectionDomain, coord, rDomain);

    // Axis
    mainG
      .select(`.${styles.axis}`)
      .selectAll('text')
      .attr('dx', axisPadding)
      .attr('dy', -axisPadding)
      .style('font-size', px(axisFontSize));

    // Data
    resources.performUpdate(groupedData);
  };

  resetTooltip = () => {
    const {
      mainG,
      resources: { resourceR, resourceStroke },
      props: { hideTooltip, tooltipOpen },
    } = this;

    // Resets tooltip
    if (tooltipOpen) hideTooltip();

    mainG
      .selectAll(`.${styles.tooltipRect}`)
      .attr('width', 2 * resourceR + resourceStroke / 2)
      .attr('fill-opacity', 0);
    // TODO: does the next line make performance wrost?
    //   .interrupt().transition();
  };

  updateSizes = () => {
    const zoomScale = 1 / this.props.k;
    this.resources.updateSizes(this.props.k);
    this.sections.updateSizes(this.props.k);

    this.size = {
      ...this.size,
      guideStroke: GUIDE_STROKE * zoomScale,
      bubbleCollision: (RESOURCE_R + 2) * zoomScale,
      tooltipWidth: TOOLTIP_WIDTH * zoomScale,
      axisPadding: AXIS_PADDING * zoomScale,
      axisFontSize: AXIS_FONT_SIZE * zoomScale,
    };
  };

  coord = (
    { category, score, name }: CoordData,
    { jittered = false, offset = 0, bisector = false }: CoordOptions
  ): CoordOut => {
    const { rScale, sectionScale } = this;

    const distance = rScale(score) + (offset || 0);
    let angle = sectionScale(category) || 0;

    if (jittered && !bisector) {
      const randomNumber = Math.abs((getHash(name || '') % 1000) / 1000);
      angle += sectionScale.bandwidth() * randomNumber;
    }

    if (bisector) {
      angle += sectionScale.bandwidth() / 2;
    }

    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    return { x, y, angle };
  };

  elementsCollide = (a: Coord, b: Coord) =>
    b.x + this.size.bubbleCollision > a.x - this.size.bubbleCollision &&
    b.x - this.size.bubbleCollision < a.x + this.size.bubbleCollision &&
    b.y + this.size.bubbleCollision > a.y - this.size.bubbleCollision &&
    b.y - this.size.bubbleCollision < a.y + this.size.bubbleCollision;

  onShowTooltip = (e: MouseEvent, d: GroupD, element: BaseType) => {
    const {
      handleTooltip,
      size: { tooltipWidth },
    } = this;

    handleTooltip(e, d.elements[0]);

    select(element)
      .attr('fill-opacity', 1)
      .transition()
      .duration(400)
      .attr('width', tooltipWidth);
  };

  onHideTooltip = (element: BaseType) => {
    const {
      resources: { resourceR, resourceStroke },
      props: { hideTooltip },
    } = this;

    const rect = select(element);

    hideTooltip();

    rect
      .transition()
      .duration(400)
      .attr('width', 2 * resourceR + resourceStroke / 2)
      .transition()
      .duration(0)
      .attr('fill-opacity', 0);
  };

  handleTooltip = (event: MouseEvent, d: D) => {
    const {
      props: { updateTooltip, parent },
    } = this;
    const wrapperNode = select(parent).node();

    if (wrapperNode) {
      const { x: dx, y: dy } = wrapperNode.getBoundingClientRect();
      const {
        x: circleLeft,
        y: circleTop,
      } = (event.target as HTMLElement).getBoundingClientRect();

      updateTooltip({
        text: d.name,
        left: circleLeft - dx,
        top: circleTop - dy,
        open: true,
      });
    }
  };
}

export default KGViz;
