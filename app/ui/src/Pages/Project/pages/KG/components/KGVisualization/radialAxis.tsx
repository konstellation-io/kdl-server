const epsilon = 1e-6;

function number(scale: any) {
  return (d: any) => +scale(d);
}

function entering() {
  return !this.__axis;
}

function radialAxis(scale: any) {
  let tickValues: any = null;
  let tickArguments: any = [4];
  let tickFormat: any = null;

  function axis(context: any) {
    const values =
      tickValues === null
        ? scale.ticks
          ? scale.ticks.apply(scale, tickArguments)
          : scale.domain()
        : tickValues;
    const format =
      tickFormat == null
        ? scale.tickFormat
          ? scale.tickFormat.apply(scale, tickArguments)
          : (x: any) => x
        : tickFormat;
    const selection = context.selection ? context.selection() : context;
    const position = number(scale.copy());

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

    let tick = selection.selectAll('.tick').data(values, scale).order();
    let tickExit = tick.exit();
    let tickEnter = tick.enter().append('g').attr('class', 'tick');
    let circle = tick.select('circle');
    let text = tick.select('text');

    tick = tick.merge(tickEnter);
    circle = circle.merge(
      tickEnter
        .append('circle')
        .attr('stroke', 'grey')
        .attr('stroke-opacity', 0.3)
        .attr('r', initialPosition)
    );
    text = text.merge(
      tickEnter
        .append('text')
        .attr('fill', 'currentColor')
        .attr('dy', '0.71em')
        .attr('x', initialPosition)
    );

    if (context !== selection) {
      tick = tick.transition(context);
      circle = circle.transition(context);
      text = text.transition(context);

      tickExit = tickExit.transition(context);
      tickExit.attr('opacity', epsilon);
      tickExit.select('circle').attr('r', initialZeroPosition);
      tickExit.select('text').attr('x', initialPosition);

      tickEnter.attr('opacity', epsilon);
    }

    tickExit.remove();

    tick.attr('opacity', 1);
    circle.attr('r', (d: any) => position(d));

    text.attr('x', (d: any) => position(d)).text(format);

    selection
      .filter(entering)
      .attr('fill', 'none')
      .attr('font-size', 10)
      .attr('font-family', 'sans-serif');

    selection.each(function () {
      this.__axis = position;
    });
  }

  axis.scale = function (_: any) {
    return arguments.length ? ((scale = _), axis) : scale;
  };

  axis.tickFormat = function (_: any) {
    return arguments.length ? ((tickFormat = _), axis) : tickFormat;
  };

  return axis;
}

export default radialAxis;
