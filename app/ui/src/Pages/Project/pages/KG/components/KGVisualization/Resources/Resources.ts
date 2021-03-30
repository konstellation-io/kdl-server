import { BaseType, Selection } from 'd3-selection';
import { Quadtree, quadtree } from 'd3-quadtree';

import { DComplete } from './../../../KGUtils';
import { ScaleBand } from 'd3-scale';
import { radialAxes } from '../radialAxis';
import { stringToId } from 'Utils/d3';
import styles from './Resources.module.scss';

export const RESOURCE_R = 4;
const RESOURCE_STROKE = 1;
const FONT_SIZE = 20;

const x = (d: DComplete) => d.x;
const y = (d: DComplete) => d.y;

export let lastSection: string | undefined;
export let textAnchor: string = '';

const COLORS = {
  DEFAULT: 'rgba(12, 52, 72, 1)',
  DEFAULT_HIGHLIGHT: '#33FFFF',
  STARRED: '#be8d41',
  STARRED_HIGHLIGHT: '#FFBB52',
};

export default class Resources {
  container: Selection<SVGGElement, unknown, null, undefined>;
  data: DComplete[] = [];
  resourceR: number = RESOURCE_R;
  resourceStroke: number = RESOURCE_STROKE;
  fontSize: number = FONT_SIZE;
  context: CanvasRenderingContext2D | null;
  canvas: Selection<HTMLCanvasElement, unknown, null, undefined>;
  clearCanvas: () => void;
  onShowTooltip: (e: MouseEvent, d: DComplete) => void;
  onHideTooltip: (element: BaseType) => void;
  onResourceSelection: (id: string, name: string, left: number) => void;
  center: { x: number; y: number };
  qt: Quadtree<DComplete>;
  moving: boolean;
  onHoverResource: (d: DComplete | null) => void;
  sectionScale: ScaleBand<string>;
  lockHighlight: string | null = null;

  constructor(
    onShowTooltip: (e: MouseEvent, d: DComplete) => void,
    onHideTooltip: (element: BaseType) => void,
    container: Selection<SVGGElement, unknown, null, undefined>,
    onResourceSelection: (id: string, name: string, left: number) => void,
    context: CanvasRenderingContext2D | null,
    clearCanvas: () => void,
    center: { x: number; y: number },
    canvas: Selection<HTMLCanvasElement, unknown, null, undefined>,
    onHoverResource: (d: DComplete | null) => void,
    sectionScale: ScaleBand<string>
  ) {
    this.onShowTooltip = onShowTooltip;
    this.onHideTooltip = onHideTooltip;
    this.onResourceSelection = onResourceSelection;
    this.container = container.select('g');
    this.context = context;
    this.canvas = canvas;
    this.clearCanvas = clearCanvas;
    this.center = center;
    this.qt = quadtree<DComplete>().x(x).y(y);
    this.moving = false;
    this.onHoverResource = onHoverResource;
    this.sectionScale = sectionScale;
  }

  drawCircles = (hover?: string | undefined, skipLink?: boolean) => {
    const {
      clearCanvas,
      context,
      data,
      lockHighlight,
      center: { x, y },
    } = this;

    if (context === null) return;

    context.globalCompositeOperation = 'screen';
    // context.fillStyle = 'rgba(12, 52, 72, 0.8)';
    // context.globalCompositeOperation = 'lighter';

    let hoveredElement: DComplete | null = null;
    let selectedElement: DComplete | null = null;
    const highlightedElements: DComplete[] = [];

    clearCanvas();
    data.forEach((d, i) => {
      let r = d.outsideMax ? RESOURCE_R * 0.7 : RESOURCE_R;
      let fillStyle = COLORS.DEFAULT;

      if (hover && d.name === hover) {
        hoveredElement = d;
        highlightedElements.push(d);
      }
      if (lockHighlight && d.name === lockHighlight) {
        selectedElement = d;
        highlightedElements.push(d);
      }

      if (d.starred) {
        fillStyle = COLORS.STARRED;
      }

      context.fillStyle = fillStyle;

      context.beginPath();
      context.moveTo(x + d.x, y + d.y);
      context.arc(x + d.x, y + d.y, r, 0, 2 * Math.PI);
      context.fill();
      context.closePath();
    });

    highlightedElements.forEach((element) => {
      let fillStyle = COLORS.DEFAULT_HIGHLIGHT;

      if (element.starred) {
        fillStyle = COLORS.STARRED_HIGHLIGHT;
      }

      context.globalCompositeOperation = 'source-over';
      context.shadowBlur = 10;
      context.shadowColor = fillStyle;

      context.beginPath();
      context.setLineDash([]);
      context.moveTo(x + element.x, y + element.y);
      context.arc(
        x + element.x,
        y + element.y,
        RESOURCE_R * 1.7,
        0,
        2 * Math.PI
      );
      context.lineWidth = 0.5;
      context.strokeStyle = fillStyle;
      context.fillStyle = fillStyle;
      context.stroke();
      context.closePath();

      context.beginPath();
      context.moveTo(x + element.x, y + element.y);
      context.arc(x + element.x, y + element.y, RESOURCE_R, 0, 2 * Math.PI);
      context.fill();
      context.closePath();

      context.shadowBlur = 0;
    });

    if (hoveredElement !== null && !selectedElement && !skipLink) {
      context.beginPath();
      context.setLineDash([4, 4]);
      context.moveTo(
        x + (hoveredElement as DComplete).x,
        y + (hoveredElement as DComplete).y
      );
      context.lineTo(250, 50);
      context.strokeStyle = (hoveredElement as DComplete).starred
        ? COLORS.STARRED_HIGHLIGHT
        : COLORS.DEFAULT_HIGHLIGHT;

      context.stroke();
      context.closePath();
    }
  };

  init = (
    container: Selection<SVGGElement, unknown, null, undefined>,
    data: DComplete[]
  ) => {
    this.data = data;
    this.container = container;

    const { drawCircles } = this;

    container.append('g').classed(styles.resourcesWrapper, true);

    this.qt.addAll(data);
    drawCircles();

    this.canvas.on('mousemove', this.onMouseMove);
    this.canvas.on('mousedown', this.onMouseDown);
    this.canvas.on('mouseup', this.onMouseUp);

    radialAxes.selectAll('.tickSection').style('opacity', 0);
    const axisToShow = radialAxes.select(
      `.${stringToId(this.sectionScale.domain()[0])}`
    );
    axisToShow.style('opacity', 1);
  };

  onMouseMove = (e: any) => {
    const x = e.offsetX - this.center.x;
    const y = e.offsetY - this.center.y;

    const hovered = this.qt.find(x, y, 50);

    let angle = Math.atan(y / x);
    angle *= 180 / Math.PI;

    if (x < 0 && y > 0) angle += 180;
    if (x < 0 && y < 0) angle += 180;
    if (x > 0 && y < 0) angle += 0;
    angle += 90;

    const realAngle = angle;

    const eachSlice = this.sectionScale.step();

    const rem = angle % eachSlice;
    const secondHalf = rem > eachSlice / 2;

    if (secondHalf) angle += eachSlice;

    if (angle > 360) angle = 0;

    const index = Math.floor(angle / eachSlice);
    const val = this.sectionScale.domain()[index];

    radialAxes.selectAll('.tickSection').style('opacity', 0);
    const axisToShow = radialAxes.select(`.${stringToId(val)}`);

    let bottom = realAngle > 90 && realAngle < 270;

    if (bottom && secondHalf && realAngle + eachSlice / 2 > 270) bottom = false;
    if (bottom && !secondHalf && realAngle - eachSlice / 2 < 90) bottom = false;

    axisToShow.style('opacity', 1);

    if (bottom && secondHalf) textAnchor = 'end';
    if (bottom && !secondHalf) textAnchor = 'start';
    if (!bottom && secondHalf) textAnchor = 'start';
    if (!bottom && !secondHalf) textAnchor = 'end';

    axisToShow.selectAll('text').style('text-anchor', textAnchor);

    this.moving = true;

    lastSection = hovered?.category;

    if (hovered) {
      this.onHoverResource(hovered);
      //   this.onShowTooltip(e, hovered);
    } else {
      this.onHoverResource(null);
      //   this.onHideTooltip(e);
    }

    this.drawCircles(hovered?.name);
  };

  onMouseDown = (e: any) => {
    this.moving = false;
  };

  onMouseUp = (e: any) => {
    if (!this.moving) {
      const resource = this.qt.find(
        e.offsetX - this.center.x,
        e.offsetY - this.center.y,
        50
      );

      if (resource) {
        this.onResourceSelection(resource.id, resource.name, -e.offsetX / 2);
      }
    }
  };

  performUpdate = (data: DComplete[], sectionScale: ScaleBand<string>) => {
    this.sectionScale = sectionScale;

    this.qt.removeAll(this.data);
    this.data = data;
    this.qt.addAll(data);

    this.drawCircles();
  };

  highlightResource = (resourceName: string | null, skipLink?: boolean) => {
    this.drawCircles(resourceName || '', skipLink);
  };
}
