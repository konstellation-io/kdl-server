// This implementation is based on the original implementation of d3-axis:
// https://github.com/d3/d3-axis/blob/master/src/axis.js

import { select } from 'd3-selection';
import { px } from 'Utils/d3';
import { ScaleLinear } from 'd3-scale';
import styles from './radialAxis.module.scss';

const epsilon = 1e-6;
const DEFAULT_ANGLE = 90;

const BG_HEIGHT = 20;
const CHAR_WIDTH = 8;
const RECT_PADDING = 10;
const ORIENTATION_DY = 10;

const LABELS_SEPARATION_TH = 1620;

export enum OrientationH {
  LEFT,
  RIGHT,
}
export enum OrientationV {
  TOP,
  BOTTOM,
}

function getX(angle: number, r: number) {
  return Math.cos(((angle - 90) * Math.PI) / 180) * r;
}
function getY(angle: number, r: number) {
  return Math.sin(((angle - 90) * Math.PI) / 180) * r - BG_HEIGHT / 2;
}

function number(scale: ScaleLinear<number, number>) {
  return (d: number) => +scale(d);
}

function entering() {
  return !this.__axis;
}

// Width is based on text length and some additional padding.
function calculateRectWidth(label: string) {
  const textLength = label.replace('.', '').length;
  return 2 * RECT_PADDING + textLength * CHAR_WIDTH;
}

function radialAxis(scale: ScaleLinear<number, number>) {
  let tickValues: number[] | null = null;
  let tickArguments: [count?: number | undefined] = [1];
  let tickFormat: any = null;
  let sections: string[] = [];
  let borderValues: number[] = [0, 0, 0, 0];
  let elements: any;
  let angle: number = DEFAULT_ANGLE;
  let orientationV: OrientationV = OrientationV.TOP;
  let orientationH: OrientationH = OrientationH.RIGHT;

  function getDefaultX(r: number) {
    const rectWidth = calculateRectWidth(tickFormat(select(this).datum()));
    const displacement = rectWidth / 2;
    const dx =
      orientationH === OrientationH.RIGHT ? displacement : -displacement;
    return getX(angle, r) + dx;
  }
  function getDefaultY(r: number) {
    const dy =
      orientationV === OrientationV.TOP ? -ORIENTATION_DY : ORIENTATION_DY;
    return getY(angle, r) + dy;
  }

  function axis(context: any) {
    const scaleTicks = scale.ticks
      ? scale.ticks.apply(scale, tickArguments)
      : scale.domain();
    let values = tickValues === null ? scaleTicks : tickValues;
    const [mx, mn] = scale.domain();
    const df = mx - mn;
    const labelsMargin = window.innerWidth < LABELS_SEPARATION_TH ? 0.3 : 0.2;
    values = values.filter(
      (v: number) =>
        v > mn + df * labelsMargin && v < mn + df * (1 - labelsMargin)
    );
    values = [mn, ...values, mx];
    borderValues = [...borderValues.slice(2, 4), mn, mx];

    const scaleTickFormat = scale.tickFormat
      ? scale.tickFormat.apply(scale, tickArguments)
      : (x: number) => x;
    const format = tickFormat == null ? scaleTickFormat : tickFormat;
    const selection = context.selection ? context.selection() : context;
    const position = number(scale.copy());
    const outside = (d: number) => borderValues.includes(d);

    function getRectWidth(d: number) {
      return calculateRectWidth(format(d));
    }

    function initialPosition(d: number) {
      const [max, min] = scale.domain();
      const half = min + (max - min) / 2;

      return d < half ? 400 : position(d);
    }

    function circleExitPosition(d: number) {
      const [max, min] = scale.domain();
      const half = min + (max - min) / 2;

      return d < half ? 400 : 0;
    }

    function getTickEnterTx(d: number) {
      const r = outside(d) ? position(d) : initialPosition(d);

      return `translate(${getDefaultX.bind(this)(r)}, ${getDefaultY.bind(this)(
        r
      )})`;
    }

    function getTickUpdateTx(d: number) {
      return `translate(${getDefaultX.bind(this)(
        position(d)
      )}, ${getDefaultY.bind(this)(position(d))})`;
    }

    function getTickExitTx(d: number) {
      if (outside(d)) return select(this).attr('transform');

      return `translate(${getDefaultX.bind(this)(
        initialPosition(d)
      )}, ${getDefaultY.bind(this)(initialPosition(d))})`;
    }

    elements = selection;

    let circle = selection
      .selectAll(`.${styles.radialGuide}`)
      .data(values, scale)
      .order();
    let tick = selection
      .selectAll(`.${styles.tick}`)
      .data(values, scale)
      .order();
    let tickExit = tick.exit();
    let tickEnter = tick
      .enter()
      .append('g')
      .classed(styles.tick, true)
      .attr('transform', getTickEnterTx);

    let circleEnter = circle
      .enter()
      .append('circle')
      .classed(styles.radialGuide, true)
      .lower();
    let circleExit = circle.exit();
    let textBg = tick.select('rect');
    let text = tick.select('text');

    tick = tick.merge(tickEnter);
    textBg = textBg.merge(
      tickEnter
        .append('rect')
        .classed(styles.edgeAxisLabelBg, outside)
        .attr('width', getRectWidth)
        .attr('x', (d: number) => -getRectWidth(d) / 2)
        .attr('height', BG_HEIGHT)
        .attr('rx', BG_HEIGHT / 2)
    );

    text = text.merge(
      tickEnter
        .append('text')
        .classed(styles.edgeAxisLabel, outside)
        .attr('dy', px(BG_HEIGHT / 2))
    );
    circle = circle.merge(circleEnter.attr('r', initialPosition));

    if (context !== selection) {
      tick = tick.transition(context);
      text = text.transition(context);
      textBg.transition(context);
      circle = circle.transition(context);

      tickExit = tickExit.transition(context);
      tickExit.attr('opacity', epsilon);
      circleExit.attr('opacity', epsilon);
      tickExit.select('circle').attr('r', circleExitPosition);
      tickExit.attr('transform', getTickExitTx);

      tickEnter.attr('opacity', epsilon);
      circleEnter.attr('opacity', epsilon);
    }

    tickExit.remove();
    circleExit.remove();

    tick.attr('opacity', 1).attr('transform', getTickUpdateTx);
    circle.attr('opacity', 1);
    circle.attr('r', (d: number) => position(d));

    text.text(format);

    selection
      .filter(entering)
      .attr('fill', 'none')
      .style('font-size', 11)
      .style('font-weight', 500)
      .style('dominant-baseline', 'ideographic')
      .attr('font-family', 'sans-serif');

    selection.each(function () {
      this.__axis = position;
    });
  }

  axis.updateActiveSection = function (section: string) {
    const sectionIdx = sections.indexOf(section);
    const newAngle = (360 / sections.length) * sectionIdx;

    angle = newAngle;

    elements
      .selectAll(`.${styles.tick}`)
      .attr(
        'transform',
        (d: number) =>
          `translate(${getX(angle, scale(d))}, ${getY(angle, scale(d))})`
      );
  };
  axis.updateOrientation = function (
    newOrientationV: OrientationV,
    newOrientationH: OrientationH
  ) {
    orientationV = newOrientationV;
    orientationH = newOrientationH;

    elements
      .selectAll(`.${styles.tick}`)
      .attr('transform', function (d: number) {
        return `translate(${getDefaultX.bind(this)(
          scale(d)
        )}, ${getDefaultY.bind(this)(scale(d))})`;
      });
  };

  axis.scale = function (_: ScaleLinear<number, number>) {
    return arguments.length ? ((scale = _), axis) : scale;
  };

  axis.sections = function (_: any) {
    return arguments.length ? ((sections = _), axis) : sections;
  };

  axis.tickFormat = function (_: any) {
    return arguments.length ? ((tickFormat = _), axis) : tickFormat;
  };

  return axis;
}

export default radialAxis;
