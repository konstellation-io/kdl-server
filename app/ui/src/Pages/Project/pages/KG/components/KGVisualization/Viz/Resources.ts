import { Coord, DComplete } from '../../../KGUtils';
import { quadtree, Quadtree } from 'd3-quadtree';
import { ScaleBand } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { D } from './KGViz';
import { scaleBand } from '@visx/scale';
import { OrientationH, OrientationV } from './radialAxis/radialAxis';
import vizStyles from '../KGVisualizationWrapper.module.scss';
import { px } from 'Utils/d3';

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

function getOrientations(
  right: boolean,
  bottom: boolean,
  secondHalf: boolean
): [OrientationV, OrientationH] {
  let orientationV: OrientationV, orientationH: OrientationH;

  if (right) {
    orientationV = secondHalf ? OrientationV.BOTTOM : OrientationV.TOP;
  } else {
    orientationV = secondHalf ? OrientationV.TOP : OrientationV.BOTTOM;
  }
  if (bottom) {
    orientationH = secondHalf ? OrientationH.LEFT : OrientationH.RIGHT;
  } else {
    orientationH = secondHalf ? OrientationH.RIGHT : OrientationH.LEFT;
  }

  return [orientationV, orientationH];
}

type Props = {
  data: DComplete[];
  canvas: HTMLCanvasElement;
  height: number;
  width: number;
  center: Coord;
  onResourceSelection: (id: string, name: string) => void;
  onHoverResource: (d: D | null) => void;
  updateActiveSection: (v: string | undefined) => void;
  updateAxisOrientation: (
    newOrientationV: OrientationV,
    newOrientationH: OrientationH
  ) => void;
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

  initialize = (sectionScale: ScaleBand<string>) => {
    const {
      canvas,
      onMouseMove,
      onMouseDown,
      onMouseUp,
      qt,
      data,
      draw,
    } = this;
    this.sectionScale = sectionScale;

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
      startResourceAnimation,
      stopResourceAnimation,
    } = this;

    const highlightedElements: DComplete[] = [];
    if (hoveredResource) highlightedElements.push(hoveredResource);

    if (highlightedResource) {
      const d = data.find((el) => el.name === highlightedResource) as DComplete;

      highlightedElements.push(d);
      startResourceAnimation(d);
    } else {
      stopResourceAnimation();
    }

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

  startResourceAnimation = (d: DComplete) => {
    const { center } = this.props;

    select(`.${vizStyles.selectedAnim}`)
      .classed(vizStyles.show, true)
      .style('top', px(center.y + d.y - RESOURCE_R))
      .style('left', px(center.x + d.x - RESOURCE_R));
  };

  stopResourceAnimation = () => {
    select(`.${vizStyles.selectedAnim}`).classed(vizStyles.show, false);
  };

  onMouseMove = (e: MouseEvent) => {
    const {
      qt,
      draw,
      sectionScale,
      getMouseAngle,
      getTextOrientations,
      props: {
        onHoverResource,
        center,
        updateActiveSection,
        updateAxisOrientation,
      },
    } = this;

    const dx = e.offsetX - center.x;
    const dy = e.offsetY - center.y;

    const hovered = qt.find(dx, dy, 50);

    const { angle, realAngle } = getMouseAngle(dx, dy);
    const [orientationV, orientationH] = getTextOrientations(realAngle);

    const sliceSize = this.sectionScale.step();
    const sectionIndex = Math.floor(angle / sliceSize);
    const activeSection = sectionScale.domain()[sectionIndex];

    updateActiveSection(activeSection);
    updateAxisOrientation(orientationV, orientationH);

    this.isMouseMoving = true;
    this.hoveredResource = hovered || null;
    onHoverResource(this.hoveredResource);
    draw();
  };

  getMouseAngle = (dx: number, dy: number) => {
    // Get polar coordinates from cartesian coordinates:
    // https://www.mathsisfun.com/polar-cartesian-coordinates.html#:~:text=Summary%3A%20to%20convert%20from%20Polar,%3D%20r%20%C3%97%20sin(%20%CE%B8%20)
    let angle = Math.atan(dy / dx);
    angle *= 180 / Math.PI;

    if (dx < 0 && dy > 0) angle += 180;
    if (dx < 0 && dy < 0) angle += 180;
    if (dx > 0 && dy < 0) angle += 0;
    angle += 90;

    const realAngle = angle;

    const sliceSize = this.sectionScale.step();

    // Adjust the angle so a section cannot be located between the upper and lower side of the chart
    // We do not want this as we do not want the axis labels to flip when mouse goes through the middle
    // of the chart inside a given section.
    const rem = angle % sliceSize;
    const secondHalf = rem > sliceSize / 2;

    if (secondHalf) angle += sliceSize;

    if (angle > 360) angle = 0;

    return { angle, realAngle };
  };

  getTextOrientations = (angle: number) => {
    const sliceSize = this.sectionScale.step();

    const rem = angle % sliceSize;
    const secondHalf = rem > sliceSize / 2;

    let bottom = angle > 90 && angle < 270;
    let right = angle > 0 && angle < 180;

    if (bottom && secondHalf && angle + sliceSize / 2 > 270) bottom = false;
    if (bottom && !secondHalf && angle - sliceSize / 2 < 90) bottom = false;

    return getOrientations(right, bottom, secondHalf);
  };

  onMouseDown = () => {
    this.isMouseMoving = false;
  };

  onMouseUp = (e: MouseEvent) => {
    const center = this.props.center;

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
