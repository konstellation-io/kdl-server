import { Coord, DComplete } from '../../../KGUtils';
import { quadtree, Quadtree } from 'd3-quadtree';
import { ScaleBand } from 'd3-scale';
import { Selection, select } from 'd3-selection';
import { D } from './KGViz';
import { scaleBand } from '@visx/scale';

export const RESOURCE_R = 4;

const MOUSE_HOVER_ACTIVATION_RADIUS = 50;
const COLORS = {
  DEFAULT: 'rgb(12,52,72)',
  DEFAULT_HIGHLIGHT: '#33FFFF',
  STARRED: '#be8d41',
  STARRED_HIGHLIGHT: '#FFBB52',
};

const x = (d: DComplete) => d.x;
const y = (d: DComplete) => d.y;

type Props = {
  data: DComplete[];
  canvas: HTMLCanvasElement;
  height: number;
  width: number;
  center: Coord;
  onResourceSelection: (id: string, name: string) => void;
  onHoverResource: (d: D | null) => void;
  updateActiveSection: (v: string | undefined) => void;
  updateAxisOrientation: (v: string) => void;
};

class Resources {
  props: Props;

  data: DComplete[];
  qt: Quadtree<DComplete>;

  sectionScale: ScaleBand<string> = scaleBand();

  canvas: Selection<HTMLCanvasElement, unknown, null, undefined>;
  context: CanvasRenderingContext2D;

  isMouseMoving: boolean = false;
  hoveredResource: DComplete | null = null;
  highlightedResource: string | null = null;
  hideTooltipLink: boolean = false;

  constructor(props: Props) {
    this.props = props;
    this.data = props.data;
    this.canvas = select(props.canvas);
    this.context = props.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.qt = quadtree<DComplete>().x(x).y(y);
  }

  clearCanvas = () => {
    this.context.clearRect(0, 0, this.props.width, this.props.height);
  };

  initialize = () => {
    const {
      canvas,
      onMouseMove,
      onMouseDown,
      onMouseUp,
      qt,
      data,
      draw,
    } = this;

    qt.addAll(data);

    canvas.on('mousemove', onMouseMove);
    canvas.on('mousedown', onMouseDown);
    canvas.on('mouseup', onMouseUp);

    draw();
  };

  update = (data: DComplete[], sectionScale: ScaleBand<string>) => {
    this.qt.removeAll(this.data);
    this.data = data;
    this.qt.addAll(data);
    this.sectionScale = sectionScale;

    this.draw();
  };

  highlightResource = (resourceName: string) => {
    this.highlightedResource = resourceName;
    this.hideTooltipLink = true;

    this.draw();
  };
  unhighlightResource = () => {
    this.highlightedResource = null;
    this.hideTooltipLink = false;

    this.draw();
  };

  hoverResource = (resourceName: string | null, skipTooltipLink?: boolean) => {
    if (skipTooltipLink !== undefined) this.hideTooltipLink = skipTooltipLink;

    this.hoveredResource = this.data.find(
      (d) => d.name === resourceName
    ) as DComplete;

    this.draw();
  };

  draw = () => {
    const {
      clearCanvas,
      context,
      hoveredResource,
      drawCircle,
      drawHighlightedCircle,
      drawTooltipLink,
      highlightedResource,
      hideTooltipLink,
      data,
    } = this;

    const highlightedElements: DComplete[] = [];
    if (hoveredResource) highlightedElements.push(hoveredResource);
    if (highlightedResource)
      highlightedElements.push(
        data.find((d) => d.name === highlightedResource) as DComplete
      );

    context.globalCompositeOperation = 'screen';

    clearCanvas();
    data.forEach(drawCircle);
    highlightedElements.forEach(drawHighlightedCircle);

    if (hoveredResource && !hideTooltipLink) drawTooltipLink(hoveredResource);
  };

  drawCircle = (d: DComplete) => {
    const {
      context,
      props: { center },
    } = this;

    const r = d.outsideMax ? RESOURCE_R * 0.7 : RESOURCE_R;

    context.fillStyle = d.starred ? COLORS.STARRED : COLORS.DEFAULT;

    context.beginPath();
    context.moveTo(center.x + d.x, center.y + d.y);
    context.arc(center.x + d.x, center.y + d.y, r, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
  };

  drawHighlightedCircle = (d: DComplete) => {
    const {
      context,
      props: { center },
    } = this;

    const fillStyle = d.starred
      ? COLORS.STARRED_HIGHLIGHT
      : COLORS.DEFAULT_HIGHLIGHT;

    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 10;
    context.shadowColor = fillStyle;

    context.beginPath();
    context.setLineDash([]);
    context.moveTo(center.x + d.x, center.y + d.y);
    context.arc(
      center.x + d.x,
      center.y + d.y,
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
    context.moveTo(center.x + d.x, center.y + d.y);
    context.arc(center.x + d.x, center.y + d.y, RESOURCE_R, 0, 2 * Math.PI);
    context.fill();
    context.closePath();

    context.shadowBlur = 0;
  };

  drawTooltipLink = (d: DComplete) => {
    const {
      context,
      props: { center },
    } = this;

    context.beginPath();
    context.setLineDash([4, 4]);
    context.moveTo(center.x + d.x, center.y + d.y);
    context.lineTo(250, 50);
    context.strokeStyle = d.starred
      ? COLORS.STARRED_HIGHLIGHT
      : COLORS.DEFAULT_HIGHLIGHT;

    context.stroke();
    context.closePath();
  };

  onMouseMove = (e: MouseEvent) => {
    const {
      qt,
      draw,
      sectionScale,
      props: {
        onHoverResource,
        center,
        updateActiveSection,
        updateAxisOrientation,
      },
    } = this;

    let textAnchor = 'start';

    const dx = e.offsetX - center.x;
    const dy = e.offsetY - center.y;

    const hovered = qt.find(dx, dy, 50);

    let angle = Math.atan(dy / dx);
    angle *= 180 / Math.PI;

    if (dx < 0 && dy > 0) angle += 180;
    if (dx < 0 && dy < 0) angle += 180;
    if (dx > 0 && dy < 0) angle += 0;
    angle += 90;

    const realAngle = angle;

    const sliceSize = this.sectionScale.step();

    const rem = angle % sliceSize;
    const secondHalf = rem > sliceSize / 2;

    if (secondHalf) angle += sliceSize;

    if (angle > 360) angle = 0;

    const sectionIndex = Math.floor(angle / sliceSize);
    const activeSection = sectionScale.domain()[sectionIndex];

    updateActiveSection(activeSection);

    let bottom = realAngle > 90 && realAngle < 270;

    if (bottom && secondHalf && realAngle + sliceSize / 2 > 270) bottom = false;
    if (bottom && !secondHalf && realAngle - sliceSize / 2 < 90) bottom = false;

    if (bottom && secondHalf) textAnchor = 'end';
    if (bottom && !secondHalf) textAnchor = 'start';
    if (!bottom && secondHalf) textAnchor = 'start';
    if (!bottom && !secondHalf) textAnchor = 'end';

    updateAxisOrientation(textAnchor);

    this.isMouseMoving = true;
    this.hoveredResource = hovered || null;
    onHoverResource(this.hoveredResource);
    draw();
  };

  onMouseDown = () => {
    this.isMouseMoving = false;
  };

  onMouseUp = (e: MouseEvent) => {
    const {
      props: { center },
    } = this;

    if (!this.isMouseMoving) {
      const resource = this.qt.find(
        e.offsetX - center.x,
        e.offsetY - center.y,
        MOUSE_HOVER_ACTIVATION_RADIUS
      );

      if (resource) {
        this.props.onResourceSelection(resource.id, resource.name);
      }
    }
  };
}

export default Resources;
