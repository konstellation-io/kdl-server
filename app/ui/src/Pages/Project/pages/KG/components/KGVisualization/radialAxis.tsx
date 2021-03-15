import { select } from 'd3-selection';
import { stringToId } from 'Utils/d3';

export let radialAxes: any;

const epsilon = 1e-6;

function getX(angle: number, r: number) {
  return Math.cos(((angle - 90) * Math.PI) / 180) * r;
}
function getY(angle: number, r: number) {
  return Math.sin(((angle - 90) * Math.PI) / 180) * r;
}

function number(scale: any) {
  return (d: any) => +scale(d);
}

function entering() {
  return !this.__axis;
}

function radialAxis(scale: any) {
  let tickValues: any = null;
  let tickArguments: any = [3];
  let tickFormat: any = null;
  let sections: string[] = [];
  let borderValues: number[] = [0, 0, 0, 0];

  function axis(context: any) {
    let values =
      tickValues === null
        ? scale.ticks
          ? scale.ticks.apply(scale, tickArguments)
          : scale.domain()
        : tickValues;
    const mx = scale.domain()[0];
    const mn = scale.domain()[1];
    const df = mx - mn;
    values = values.filter(
      (v: number) => v > mn + df * 0.1 && v < mn + df * 0.8
    );
    values = [mn, ...values, mx];
    borderValues = [...borderValues.slice(2, 4), mn, mx];

    const format =
      tickFormat == null
        ? scale.tickFormat
          ? scale.tickFormat.apply(scale, tickArguments)
          : (x: any) => x
        : tickFormat;
    const selection = context.selection ? context.selection() : context;
    const position = number(scale.copy());
    const outside = (d: any) => borderValues.includes(d);

    function initialPosition(d: any) {
      const [max, min] = scale.domain();
      const half = min + (max - min) / 2;

      return d < half ? 400 : position(d);
    }

    function initialZeroPosition(d: any) {
      const [max, min] = scale.domain();
      const half = min + (max - min) / 2;

      return d < half ? 400 : 0;
    }

    let sec = selection
      .selectAll('.tickSection')
      .data(sections.map((s, i) => [s, (360 / sections.length) * i]));
    let secExit = sec.exit();
    let secEnter = sec
      .enter()
      .append('g')
      .attr('class', (d: any) => `tickSection ${stringToId(d[0])}`);
    sec = sec.merge(secEnter);

    radialAxes = selection;

    let tick = sec.selectAll('.tick').data(values, scale).order();
    let tickExit = tick.exit();
    let tickEnter = tick.enter().append('g').attr('class', 'tick');
    let circle = selection
      .selectAll('.radialGuide')
      .data(values, scale)
      .order();
    let circleEnter = circle
      .enter()
      .append('circle')
      .attr('class', 'radialGuide');
    let circleExit = circle.exit();
    let text = tick.select('text');

    tick = tick.merge(tickEnter);
    circle = circle.merge(
      circleEnter
        .attr('stroke', 'grey')
        .attr('stroke-opacity', 0.3)
        .attr('r', initialPosition)
    );
    text = text.merge(
      tickEnter
        .append('text')
        .classed('edgeAxisLabel', outside)
        .attr('fill', 'currentColor')
        .attr('dy', '0.71em')
        .attr('x', function (d: any) {
          const secData: any = select(this.parentNode.parentNode).datum();
          const r = outside(d) ? position(d) : initialPosition(d);
          const angle = secData[1];

          return getX(angle, r);
        })
        .attr('y', function (d: any) {
          const secData: any = select(this.parentNode.parentNode).datum();
          const r = outside(d) ? position(d) : initialPosition(d);
          const angle = secData[1];

          return getY(angle, r);
        })
    );

    if (context !== selection) {
      tick = tick.transition(context);
      circle = circle.transition(context);
      text = text.transition(context);

      tickExit = tickExit.transition(context);
      tickExit.attr('opacity', epsilon);
      circleExit.attr('opacity', epsilon);
      tickExit.select('circle').attr('r', initialZeroPosition);
      tickExit
        .select('text')
        .attr('x', function (d: any) {
          if (outside(d)) return select(this).attr('x');

          const secData: any = select(this.parentNode.parentNode).datum();
          const r = initialPosition(d);
          const angle = secData[1];

          return getX(angle, r);
        })
        .attr('y', function (d: any) {
          if (outside(d)) return select(this).attr('y');

          const secData: any = select(this.parentNode.parentNode).datum();
          const r = initialPosition(d);
          const angle = secData[1];

          return getY(angle, r);
        });

      tickEnter.attr('opacity', epsilon);
      circleEnter.attr('opacity', epsilon);
    }

    tickExit.remove();
    secExit.remove();
    circleExit.remove();

    tick.attr('opacity', 1);
    circle.attr('opacity', 1);
    circle.attr('r', (d: any) => position(d));

    text
      .attr('x', function (d: any) {
        const secData: any = select(this.parentNode.parentNode).datum();
        const r = position(d);
        const angle = secData[1];

        return getX(angle, r);
      })
      .attr('y', function (d: any) {
        const secData: any = select(this.parentNode.parentNode).datum();
        const r = position(d);
        const angle = secData[1];

        return getY(angle, r);
      })
      .text(format);

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

  axis.scale = function (_: any) {
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
