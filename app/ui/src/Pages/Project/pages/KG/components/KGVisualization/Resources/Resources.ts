import { BaseType, Selection } from 'd3-selection';
import { Quadtree, quadtree } from 'd3-quadtree';

import { DComplete } from './../../../KGUtils';
import styles from './Resources.module.scss';

export const RESOURCE_R = 4;
const RESOURCE_STROKE = 1;
const FONT_SIZE = 20;

const x = (d: DComplete) => d.x;
const y = (d: DComplete) => d.y;

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
  onResourceSelection: (name: string) => void;
  center: { x: number; y: number };
  qt: Quadtree<DComplete>;

  constructor(
    onShowTooltip: (e: MouseEvent, d: DComplete) => void,
    onHideTooltip: (element: BaseType) => void,
    container: Selection<SVGGElement, unknown, null, undefined>,
    onResourceSelection: (name: string) => void,
    context: CanvasRenderingContext2D | null,
    clearCanvas: () => void,
    center: { x: number; y: number },
    canvas: Selection<HTMLCanvasElement, unknown, null, undefined>
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
  }

  drawCircles = (hover?: string | undefined) => {
    const {
      clearCanvas,
      context,
      data,
      center: { x, y },
    } = this;

    if (context === null) return;

    context.fillStyle = 'rgba(43, 217, 217, 0.4)';
    // context.globalCompositeOperation = 'lighter';
    // context.fillStyle = 'rgba(12, 52, 72, 0.8)';
    // context.globalCompositeOperation = 'lighter';

    clearCanvas();
    data.forEach((d) => {
      if (hover) {
        context.fillStyle =
          d.name === hover ? 'white' : 'rgba(43, 217, 217, 0.2)';
      }

      const r = d.outsideMax ? RESOURCE_R * 0.7 : RESOURCE_R;
      context.beginPath();
      context.moveTo(x + d.x, y + d.y);
      context.arc(x + d.x, y + d.y, r, 0, 2 * Math.PI);
      context.fill();
    });
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
  };

  onMouseMove = (e: any) => {
    const hovered = this.qt.find(
      e.offsetX - this.center.x,
      e.offsetY - this.center.y,
      50
    );

    if (hovered) {
      this.onShowTooltip(e, hovered);
    } else {
      this.onHideTooltip(e);
    }

    this.drawCircles(hovered?.name);
  };

  performUpdate = (data: DComplete[]) => {
    this.qt.removeAll(this.data);
    this.data = data;
    this.qt.addAll(data);

    this.drawCircles();
  };

  highlightResource = (resourceName: string | null) => {
    this.drawCircles(resourceName || '');
  };
}
