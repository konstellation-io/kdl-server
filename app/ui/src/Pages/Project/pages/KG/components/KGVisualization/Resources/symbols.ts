const viewBoxSize = 24;

export const code = {
  draw: function (context: any, size: number) {
    const v = (n: number) => size * (n / viewBoxSize);

    context.moveTo(v(9.4), v(16.6));
    context.lineTo(v(4.8), v(12));
    context.lineTo(v(9.4), v(7.4));
    context.lineTo(v(8), v(6));
    context.lineTo(v(2), v(12));
    context.lineTo(v(8), v(18));
    context.lineTo(v(9.4), v(16.6));
    context.closePath();

    context.moveTo(v(14.6), v(16.6));
    context.lineTo(v(19.2), v(12));
    context.lineTo(v(14.6), v(7.4));
    context.lineTo(v(16), v(6));
    context.lineTo(v(22), v(12));
    context.lineTo(v(16), v(18));
    context.lineTo(v(14.6), v(16.6));
    context.closePath();
  },
};

export const paper = {
  draw: function (context: any, size: number) {
    const v = (n: number) => size * (n / viewBoxSize);

    context.moveTo(v(14), v(2));
    context.lineTo(v(6), v(2));
    context.arcTo(v(4), v(2), v(4.01), v(4), v(2));
    context.lineTo(v(4), v(20));
    context.arcTo(v(4), v(22), v(5.99), v(22), v(2));
    context.lineTo(v(18), v(22));
    context.arcTo(v(20), v(22), v(20), v(20), v(2));
    context.lineTo(v(20), v(8));
    context.lineTo(v(14), v(2));
    context.closePath();

    context.moveTo(v(16), v(18));
    context.lineTo(v(8), v(18));
    context.lineTo(v(8), v(16));
    context.lineTo(v(16), v(16));
    context.lineTo(v(16), v(18));
    context.closePath();

    context.moveTo(v(16), v(14));
    context.lineTo(v(8), v(14));
    context.lineTo(v(8), v(12));
    context.lineTo(v(16), v(12));
    context.lineTo(v(16), v(12));
    context.closePath();

    context.moveTo(v(13), v(9));
    context.lineTo(v(13), v(3.5));
    context.lineTo(v(18.5), v(9));
    context.lineTo(v(13), v(9));
    context.closePath();
  },
};

const SYMBOL = {
  CODE: code,
  DOC: paper,
};

export default SYMBOL;
