import 'd3-transition';

import { Coord, DComplete, getHash, groupData } from '../../KGUtils';
import { Local, Selection, local, select } from 'd3-selection';
import Resources, { RESOURCE_R } from './Resources/Resources';
import { max, min } from 'd3-array';
import { scaleBand, scaleLinear } from '@visx/scale';

import { D } from './KGVisualization';
import MinimapViz from '../Minimap/MinimapViz';
import Sections from './Sections/Sections';
import { UpdateTooltip } from 'Hooks/useTooltip';
import { px } from 'Utils/d3';
import radialAxis from './radialAxis';
import styles from './KGVisualization.module.scss';

export const PADDING_H = 0.25;
export const PADDING_V = 0.15;

const TOOLTIP_WIDTH = 300;
export const INNER_R = 53.5;
const GUIDE_STROKE = 1;
const AXIS_PADDING = 8;
const AXIS_FONT_SIZE = 12;

export const N_GUIDES = 2;

export let minimapViz: MinimapViz;
export let resourcesViz: Resources;

const section = (d: D) => d.category;
const score = (d: D) => d.score;

export function getInnerDimensions(width: number, height: number) {
  const innerWidth = (1 - 2 * PADDING_H) * width;
  const innerHeight = (1 - 2 * PADDING_V) * height;
  const outerR = Math.min(innerWidth / 2, innerHeight / 2);

  return { innerWidth, innerHeight, outerR };
}

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
  hash?: number;
};

type Props = {
  width: number;
  parent: SVGSVGElement;
  canvas: HTMLCanvasElement;
  data: D[];
  height: number;
  updateTooltip: (p: UpdateTooltip<D>) => void;
  hideTooltip: () => void;
  // minimapRef: SVGSVGElement;
  tooltipOpen: boolean;
  onResourceSelection: (d: D) => void;
  centerText: string;
  onScroll: (dS: number) => void;
  scores: [number, number];
  onHoverResource: (d: DComplete | null) => void;
};

class KGViz {
  props: Props;
  wrapper: Selection<SVGGElement, unknown, null, undefined>;
  canvas: Selection<HTMLCanvasElement, unknown, null, undefined>;
  context: CanvasRenderingContext2D | null;
  mainG: Selection<SVGGElement, unknown, null, undefined>;
  center: Coord;
  rScale = scaleLinear<number>();
  rDomain: [number, number] = [0, 0];
  sectionScale = scaleBand();
  sectionDomain: string[];
  groupedData: DComplete[];
  // minimap: MinimapViz;
  sectionOrientation: Local<string>;
  resources: Resources;
  sections: Sections;
  axisG: any = null;
  axis: any;
  size: {
    innerWidth: number;
    innerHeight: number;
    guideStroke: number;
    bubbleCollision: number;
    tooltipWidth: number;
    axisPadding: number;
    axisFontSize: number;
  };
  data: D[];
  scores: [number, number];
  minScore: number;
  maxScore: number;
  outerR: number = 0;

  constructor(wrapper: SVGGElement, props: Props) {
    console.log('CONSTRUCTOR');

    this.wrapper = select(wrapper);
    this.canvas = select(props.canvas);
    this.context = props.canvas.getContext('2d');
    this.mainG = select(wrapper);
    this.props = props;
    this.groupedData = [];
    this.sectionDomain = [];
    this.data = props.data;

    const { innerWidth, innerHeight, outerR } = getInnerDimensions(
      props.width,
      props.height
    );
    this.center = { x: props.width / 2, y: props.height / 2 };
    this.outerR = outerR;
    this.size = {
      innerWidth,
      innerHeight,
      guideStroke: GUIDE_STROKE,
      bubbleCollision: RESOURCE_R + 2,
      tooltipWidth: TOOLTIP_WIDTH,
      axisPadding: AXIS_PADDING,
      axisFontSize: AXIS_FONT_SIZE,
    };

    this.rScale = scaleLinear({
      range: [INNER_R + RESOURCE_R, this.outerR - RESOURCE_R],
      domain: props.scores,
    });
    this.sectionScale = scaleBand({
      range: [0, 360],
      padding: 0,
    });

    this.axis = radialAxis(this.rScale).tickFormat(
      (t: string) => `${Math.round(+t * 10000) / 100}%`
    );

    // this.minimap = new MinimapViz(props.minimapRef, {
    //   areaWidth: props.width,
    //   areaHeight: props.height,
    //   x: props.x,
    //   y: props.y,
    //   k: props.k,
    //   initialZoomValues: props.initialZoomValues,
    //   reallocateZoom: props.reallocateZoom,
    // });
    // minimapViz = this.minimap;

    this.sectionOrientation = local<string>();

    this.resources = new Resources(
      this.onShowTooltip,
      this.onHideTooltip,
      this.wrapper,
      this.props.onResourceSelection,
      this.context,
      this.clearCanvas,
      this.center,
      select(this.props.canvas),
      props.onHoverResource
    );
    resourcesViz = this.resources;

    this.sections = new Sections(this.wrapper);

    this.scores = props.scores;
    this.maxScore = this.scores[0];
    this.minScore = this.scores[1];

    this.cleanup();
    this.initialize();
  }

  clearCanvas = () => {
    this.context?.clearRect(0, 0, this.props.width, this.props.height);
  };

  cleanup = () => {
    this.wrapper.selectAll('*').remove();
  };

  updateScalesAndData = (data: D[]) => {
    this.sectionDomain = Array.from(new Set(data.map(section)));

    this.rDomain = [max(data, score) ?? 1, min(data, score) ?? 0];

    this.sectionScale.domain(this.sectionDomain);
    this.rScale.domain(this.rDomain);

    this.axis.scale(this.rScale);
    if (this.axisG) this.axisG.call(this.axis);

    this.groupedData = groupData(
      data,
      this.coord,
      this.minScore,
      this.maxScore
    );
  };

  initialize = () => {
    this.updateScalesAndData(this.props.data);
    console.log('INIT');

    // this.minimap.initialize(this.groupedData);

    const {
      sections,
      wrapper,
      center,
      groupedData,
      sectionDomain,
      coord,
      outerR,
      rDomain,
      resources,
      updateAxisLabels,
      size: { axisPadding, axisFontSize },
      props: { centerText },
    } = this;

    // Add structural elements
    // center wrapper
    this.mainG = wrapper
      .append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);

    const { mainG } = this;

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
    mainG.append('circle').classed(styles.outerCircle, true).attr('r', outerR);

    // Radius axis
    this.axisG = mainG.append('g');
    this.axisG.call(this.axis);

    const axis = mainG
      .append('g')
      .classed(styles.axis, true)
      .attr('transform', `translate(${INNER_R + 1}, 0)`);

    // axis.append('text').classed(styles.label1, true);
    // axis
    //   .append('text')
    //   .classed(styles.label4, true)
    //   .attr('x', OUTER_R - INNER_R);
    axis
      .selectAll('text')
      .attr('dx', axisPadding)
      .attr('dy', -axisPadding)
      .style('font-size', px(axisFontSize));

    updateAxisLabels();

    // Data elements
    resources.init(mainG, groupedData);
  };

  updateAxisLabels = () => {
    this.axisG.transition().duration(400).call(this.axis);
  };

  highlightResource = (resourceName: string | null) => {
    this.resources.highlightResource(resourceName);
  };

  updateCenterText = (newCenterText: string) => {
    const { mainG } = this;

    mainG.select(`.${styles.innerCircleText}`).html(newCenterText);
  };

  updateScores = (data: D[], scores: [number, number]) => {
    this.scores = scores;
    this.maxScore = scores[0];
    this.minScore = scores[1];
    const { resources } = this;

    this.rScale.domain(scores);
    this.axis.scale(this.rScale);

    this.groupedData = groupData(
      data,
      this.coord,
      this.minScore,
      this.maxScore
    );

    resources.performUpdate(this.groupedData);
    this.updateAxisLabels();
  };

  update = (data: D[], scores: [number, number]) => {
    console.log('UPDATE');
    this.data = data;
    this.scores = scores;
    this.maxScore = scores[0];
    this.minScore = scores[1];

    this.updateScalesAndData(data);

    // this.minimap.update(this.groupedData, zoomValues, reallocateZoom);

    const {
      sections,
      mainG,
      groupedData,
      resetTooltip,
      sectionDomain,
      resources,
      coord,
      rDomain,
      updateAxisLabels,
      size: { axisPadding, axisFontSize },
    } = this;

    resetTooltip();

    // Sections
    sections.performUpdate(sectionDomain, coord, rDomain);

    updateAxisLabels();

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
  };

  coord = (
    { category, score, name }: CoordData,
    { jittered = false, offset = 0, bisector = false }: CoordOptions
  ): CoordOut => {
    const { rScale, sectionScale } = this;

    const distance = rScale(score) + (offset || 0);
    let angle = sectionScale(category) || 0;
    let hash = 0;

    if (jittered && !bisector) {
      hash = Math.abs((getHash(name || '') % 10000) / 10000);

      angle += sectionScale.bandwidth() * hash;
    }

    if (bisector) {
      angle += sectionScale.bandwidth() / 2;
    }

    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    return { x, y, angle, hash };
  };

  onShowTooltip = (e: MouseEvent, d: DComplete) => {
    const { handleTooltip } = this;

    handleTooltip(d);
  };

  onHideTooltip = () => {
    const {
      props: { hideTooltip },
    } = this;

    hideTooltip();
  };

  handleTooltip = (d: DComplete) => {
    const {
      center,
      props: { updateTooltip },
    } = this;

    updateTooltip({
      data: d,
      left: d.x + center.x,
      top: d.y + center.y,
      open: true,
    });
  };
}

export default KGViz;
