import { Coord, DComplete } from '../../../../KGUtils';
import { quadtree, Quadtree } from 'd3-quadtree';
import { ScaleBand } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import { D } from '../KGViz';
import { scaleBand } from '@visx/scale';
import { OrientationH, OrientationV } from '../radialAxis/radialAxis';
import vizStyles from '../../KGVisualizationWrapper.module.scss';
import { px } from 'Utils/d3';
import COLORS from './Resources.module.scss';

export const RESOURCE_R = 4;
const MAX_RESOURCE_R = 6;
const MIN_RESOURCE_R = 1;
const MAX_RESOURCE_OPACITY = 1;
const MIN_RESOURCE_OPACITY = 0.3;
const OUTSIDE_MAX_RESOURCE_R = 3;
const LOWLIGHT_RESOURCE_OPACITY = 0.3;

const MOUSE_HOVER_ACTIVATION_RADIUS = 50;

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

  activeSection: string | null = null;

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
    const { canvas, onMouseMove, onMouseDown, onMouseUp, qt, data, draw } =
      this;
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

  getResourceR = (d: DComplete) => {
    if (d.outsideMax) return OUTSIDE_MAX_RESOURCE_R;

    const radiusMaxIncrement = MAX_RESOURCE_R - MIN_RESOURCE_R;
    return MIN_RESOURCE_R + (1 - d.distanceToCenter) * radiusMaxIncrement;
  };

  getResourceOpacity = (d: DComplete) => {
    const { hoveredResource, highlightedResource } = this;

    const shouldLowlight = hoveredResource || highlightedResource;
    // Uncomment for section hover highlight implementation and remove previous line
    // const shouldLowlight =
    //   this.activeSection !== null && d.category !== this.activeSection;

    if (shouldLowlight) return LOWLIGHT_RESOURCE_OPACITY;
    if (d.outsideMin) return 1;

    const opacityMaxIncrement = MAX_RESOURCE_OPACITY - MIN_RESOURCE_OPACITY;
    return (
      MIN_RESOURCE_OPACITY + (1 - d.distanceToCenter) * opacityMaxIncrement
    );
  };

  drawCircle = (d: DComplete) => {
    const {
      context,
      getResourceR,
      getResourceOpacity,
      props: { center },
    } = this;

    const r = getResourceR(d);

    context.fillStyle = d.starred ? COLORS.starred : COLORS.default;
    context.globalAlpha = getResourceOpacity(d);

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
      ? COLORS.starredHighlight
      : COLORS.defaultHighlight;

    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 10;
    context.shadowColor = fillStyle;
    context.globalAlpha = 1;

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

    context.globalAlpha = 1;
    context.beginPath();
    context.setLineDash([4, 4]);
    context.moveTo(center.x + d.x, center.y + d.y);
    context.lineTo(250, 50);
    context.strokeStyle = d.starred
      ? COLORS.starredHighlight
      : COLORS.defaultHighlight;

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
      getMouseAngle,
      getTextOrientations,
      getActiveSection,
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

    const angle = getMouseAngle(dx, dy);
    const [orientationV, orientationH] = getTextOrientations(angle);

    const { activeSection, mouseActiveSection } = getActiveSection(angle);
    this.activeSection = hovered ? activeSection : null;

    updateActiveSection(mouseActiveSection);
    updateAxisOrientation(orientationV, orientationH);

    this.hideTooltipLink = false;
    this.isMouseMoving = true;
    this.hoveredResource = hovered || null;
    onHoverResource(this.hoveredResource);
    draw();
  };

  getActiveSection = (angle: number) => {
    const { sectionScale, isMouseOnSecondSectionHalf } = this;

    let correctedAngle = angle;
    const sliceSize = sectionScale.step();
    const secondHalf = isMouseOnSecondSectionHalf(angle);

    // If angle is within the second half of a section, we shift the angle to be in the next section
    if (secondHalf) correctedAngle += sliceSize;
    correctedAngle %= 360;

    const sectionIndex = Math.floor(angle / sliceSize);
    const mouseSectionIndex = Math.floor(correctedAngle / sliceSize);

    return {
      activeSection: sectionScale.domain()[sectionIndex],
      mouseActiveSection: sectionScale.domain()[mouseSectionIndex],
    };
  };

  isMouseOnSecondSectionHalf = (angle: number) => {
    const { sectionScale } = this;

    const sliceSize = sectionScale.step();
    const sectionAngle = angle % sliceSize;

    return sectionAngle > sliceSize / 2;
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

    return angle;
  };

  getTextOrientations = (angle: number) => {
    const { getActiveSection, sectionScale, isMouseOnSecondSectionHalf } = this;

    const sliceSize = sectionScale.step();

    const { activeSection } = getActiveSection(angle);
    const secondHalf = isMouseOnSecondSectionHalf(angle);

    const bottomThreshold = [90, 270];
    const sectionAngle0 = (sectionScale(activeSection || '') || 0) + 90;
    const sectionAngle1 = sectionAngle0 + sliceSize;
    const sectionBisector = sectionAngle0 + (sectionAngle1 - sectionAngle0) / 2;

    // Make a correction to the bottom threshold so it can only be outside of a section or
    // exactly in the middle of it. With this, we fix the section between sides problem
    if (sectionAngle0 < 90 && 90 < sectionAngle1) {
      bottomThreshold[0] = sectionBisector;
    }
    if (sectionAngle0 < 270 && 270 < sectionAngle1) {
      bottomThreshold[1] = sectionBisector;
    }

    let bottom = angle > bottomThreshold[0] && angle < bottomThreshold[1];
    let right = angle > 0 && angle < 180;

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
