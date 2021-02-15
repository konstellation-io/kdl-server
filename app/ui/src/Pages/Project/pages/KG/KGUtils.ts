import { color, RGBColor } from 'd3-color';
import { scaleLinear } from '@visx/scale';

const TEXT_COLOR_THRESHOLD = 120;
const TEXT_COLOR = {
  DARK: '#00252E',
  LIGHT: '#CCF5FF',
};

const COLOR_SCALE_COLORS = ['#176177', '#D6FFFF'];
export const colorScale = scaleLinear({
  domain: [1, 10],
  range: COLOR_SCALE_COLORS,
});

export function getNumberColor(elementsCount: number) {
  const c: RGBColor = color(colorScale(elementsCount).toString()) as RGBColor;
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > TEXT_COLOR_THRESHOLD
    ? TEXT_COLOR.DARK
    : TEXT_COLOR.LIGHT;
}
