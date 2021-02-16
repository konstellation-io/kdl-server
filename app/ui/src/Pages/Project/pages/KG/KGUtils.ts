import { CoordData, CoordOptions } from './components/KGVisualization/KGViz';
import { D, TopicSections } from './components/KGVisualization/KGVisualization';
import { RGBColor, color } from 'd3-color';

import { orderBy } from 'lodash';
import { scaleLinear } from '@visx/scale';

const TEXT_COLOR_THRESHOLD = 120;
const TEXT_COLOR = {
  DARK: '#00252E',
  LIGHT: '#CCF5FF',
};
const COLOR_SCALE_COLORS = ['#176177', '#D6FFFF'];

export type Coord = {
  x: number;
  y: number;
};

interface DComplete extends D {
  x: number;
  y: number;
}

export interface GroupD {
  x: number;
  y: number;
  elements: DComplete[];
}

export const colorScale = scaleLinear({
  domain: [1, 10],
  range: COLOR_SCALE_COLORS,
});

export function getColorNumber(elementsCount: number) {
  const c: RGBColor = color(colorScale(elementsCount).toString()) as RGBColor;
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > TEXT_COLOR_THRESHOLD
    ? TEXT_COLOR.DARK
    : TEXT_COLOR.LIGHT;
}

export function getHash(text: string) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }

  return hash;
}

export function groupData(
  data: D[],
  coord: ({ category, score, name }: CoordData, options: CoordOptions) => Coord,
  elementsCollide: (a: Coord, b: Coord) => boolean
) {
  const groupedData: GroupD[] = [];

  data.forEach((d) => {
    const { x, y } = coord(d, { jittered: true });
    const newD: DComplete = { ...d, x, y };
    let collisionEl;
    let collisionIdx = 0;

    for (let idx = 0; idx < groupedData.length; idx++) {
      const nd = groupedData[idx];
      if (nd && elementsCollide({ x: nd.x, y: nd.y }, { x, y })) {
        collisionEl = nd;
        collisionIdx = idx;
        break;
      }
    }

    if (collisionEl) {
      groupedData[collisionIdx] = {
        elements: [...groupedData[collisionIdx].elements, newD],
        x: (x + collisionEl.x) / 2,
        y: (y + collisionEl.y) / 2,
      };
    } else {
      groupedData.push({ elements: [newD], x, y });
    }
  });


  return groupedData;
}

export function getSectionsAndNames(newData: D[]) {
  const result: TopicSections = {};

  const sortedData = orderBy(newData, ['score'], ['desc']);

  sortedData.forEach(({ name, category }) => {
    if (category in result) result[category].push(name);
    else result[category] = [name];
  });

  return result;
}
