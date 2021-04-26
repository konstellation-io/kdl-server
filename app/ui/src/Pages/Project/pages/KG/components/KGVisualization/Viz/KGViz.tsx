import 'd3-transition';

import { select, Selection } from 'd3-selection';
import { Coord, DComplete, getHash, groupData } from '../../../KGUtils';
import BG from './BG/BG';
import { scaleBand, scaleLinear } from '@visx/scale';
import Resources, { RESOURCE_R } from './Resources/Resources';
import radialAxis, {
  OrientationH,
  OrientationV,
} from './radialAxis/radialAxis';
import Sections from './Sections/Sections';
import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';

const MARGIN_TOP = 50;
export const PADDING_H = 0.25; // 25% each side
export const PADDING_V = 0.15; // 15% each side

export const INNER_R = 53.5;

const section = (d: D) => d.category;

const formatScore = (t: string) => `${Math.round(+t * 10000) / 100}%`;

export type D = {
  id: string;
  category: string;
  type: KnowledgeGraphItemCat;
  name: string;
  score: number;
  starred: boolean;
};

type Props = {
  data: D[];
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  labelsSvg: SVGSVGElement;
  height: number;
  width: number;
  scores: [number, number];
  onResourceSelection: (id: string, name: string) => void;
  onHoverResource: (d: D | null) => void;
};

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

export function getVizDimensions(width: number, height: number) {
  const innerWidth = (1 - 2 * PADDING_H) * width;
  const innerHeight = (1 - 2 * PADDING_V) * (height - MARGIN_TOP);
  const outerR = Math.min(innerWidth / 2, innerHeight / 2);

  const center = { x: width / 2, y: height / 2 + MARGIN_TOP };

  return { innerWidth, innerHeight, outerR, center };
}

class KGViz {
  props: Props;
  parent: HTMLDivElement;
  wrapper: Selection<SVGGElement, unknown, null, undefined>;
  context: CanvasRenderingContext2D | null;
  mainG: Selection<SVGGElement, unknown, null, undefined>;
  labelsSvg: Selection<SVGSVGElement, unknown, null, undefined>;

  data: D[];
  groupedData: DComplete[];
  scores: [number, number];

  rScale = scaleLinear<number>();
  sectionScale = scaleBand<string>();

  bg: BG;
  resources: Resources;
  sections: Sections;

  axisG: Selection<SVGGElement, unknown, null, undefined> = select(
    {} as SVGGElement
  );
  axis: any;

  center: Coord;
  innerWidth: number;
  innerHeight: number;
  outerR: number;

  constructor(wrapper: SVGGElement, props: Props) {
    this.props = props;
    this.parent = props.container;
    this.wrapper = select(wrapper);
    this.mainG = select(wrapper);
    this.labelsSvg = select(props.labelsSvg);
    this.context = props.canvas.getContext('2d');

    this.data = props.data;
    this.scores = props.scores;

    const { innerWidth, innerHeight, outerR, center } = getVizDimensions(
      props.width,
      props.height
    );
    this.center = center;
    this.innerWidth = innerWidth;
    this.innerHeight = innerHeight;
    this.outerR = outerR;

    this.rScale = scaleLinear({
      range: [INNER_R, this.outerR - RESOURCE_R],
      domain: props.scores,
    });
    this.sectionScale = scaleBand({
      range: [-90, 270],
      domain: this.sectionDomain(),
      padding: 0,
    });

    this.axis = radialAxis(this.rScale)
      .tickFormat(formatScore)
      .sections(this.sectionDomain());

    this.groupedData = groupData(props.data, this.coord, props.scores);

    this.bg = new BG();
    this.resources = new Resources({
      data: this.groupedData,
      canvas: props.canvas,
      height: props.height,
      width: props.width,
      center: this.center,
      onResourceSelection: props.onResourceSelection,
      onHoverResource: props.onHoverResource,
      updateActiveSection: this.updateActiveSection,
      updateAxisOrientation: this.updateAxisOrientation,
    });
    this.sections = new Sections(this.coord);

    this.cleanup();
    this.initialize();
  }

  cleanup = () => {
    this.wrapper.selectAll('*').remove();
    this.labelsSvg.selectAll('*').remove();
    this.resources.clearCanvas();
  };

  sectionDomain = () => Array.from(new Set(this.data.map(section)));

  initialize = () => {
    const {
      wrapper,
      center,
      bg,
      outerR,
      resources,
      sections,
      sectionScale,
      scores,
      labelsSvg,
    } = this;

    this.mainG = wrapper
      .append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);
    this.axisG = labelsSvg
      .append('g')
      .attr('transform', `translate(${center.x}, ${center.y})`);

    bg.initialize(this.mainG, outerR);
    resources.initialize(this.sectionScale);
    sections.initialize(this.mainG, sectionScale, scores);

    this.axisG.call(this.axis);
  };

  update = (data: D[], scores: [number, number]) => {
    this.data = data;
    this.scores = scores;
    this.rScale.domain(scores);
    this.sectionScale.domain(this.sectionDomain());

    this.groupedData = groupData(data, this.coord, scores);

    this.axis.scale(this.rScale);
    this.axis.sections(this.sectionDomain());
    this.axisG.transition().duration(400).call(this.axis);

    this.sections.update(this.sectionScale, scores);
    this.resources.update(this.groupedData, this.sectionScale);
  };

  updateAxisOrientation = (
    newOrientationV: OrientationV,
    newOrientationH: OrientationH
  ) => {
    this.axis.updateOrientation(newOrientationV, newOrientationH);
  };
  updateActiveSection = (activeSection: string | undefined) => {
    this.axis.updateActiveSection(activeSection);
  };

  coord = (
    { category, score, name }: CoordData,
    options?: CoordOptions
  ): CoordOut => {
    const { rScale, sectionScale } = this;

    const distance = rScale(score) + (options?.offset || 0);
    let angle = sectionScale(category) || 0;
    let hash = 0;

    if (options?.jittered && !options?.bisector) {
      hash = Math.abs((getHash(name || '') % 10000) / 10000);

      angle += sectionScale.bandwidth() * hash;
    }

    if (options?.bisector) {
      angle += sectionScale.bandwidth() / 2;
    }

    const dx = Math.cos((angle * Math.PI) / 180) * distance;
    const dy = Math.sin((angle * Math.PI) / 180) * distance;

    return { x: dx, y: dy, angle, hash };
  };

  getResourceCoords = (resourceId: string) => {
    const { groupedData, center } = this;
    const resource = groupedData.find((d) => d.id === resourceId);

    return {
      x: center.x + (resource?.x || 0),
      y: center.y + (resource?.y || 0),
    };
  };
}

export default KGViz;
