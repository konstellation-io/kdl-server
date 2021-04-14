import {
  CoordData,
  CoordOptions,
  CoordOut,
  D,
} from './components/KGVisualization/Viz/KGViz';
import { color, RGBColor } from 'd3-color';

import { KGItem } from './KG';
import { orderBy } from 'lodash';
import { scaleLinear } from '@visx/scale';

export interface TopicSections {
  [key: string]: string[];
}

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

export interface DComplete extends D {
  x: number;
  y: number;
  outsideMin: boolean;
  outsideMax: boolean;
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

function getOffset(outsideMin: boolean, outsideMax: boolean) {
  if (outsideMin) return 17;
  if (outsideMax) return -6;

  return 0;
}

export function buildD(d: KGItem): D {
  return {
    id: d.id,
    category: d.topic?.name || 'Others',
    type: d.category,
    name: d.title,
    score: d.score,
    starred: d.starred,
  };
}

export function groupData(
  data: D[],
  coord: (
    { category, score, name }: CoordData,
    options: CoordOptions
  ) => CoordOut,
  scores: [number, number]
): DComplete[] {
  const [maxScore, minScore] = scores;

  return data.map((d) => {
    const outsideMin = d.score < minScore;
    const outsideMax = d.score > maxScore;

    const { x, y } = coord(
      {
        ...d,
        score: Math.max(minScore, Math.min(maxScore, d.score)),
      },
      { jittered: true, offset: getOffset(outsideMin, outsideMax) }
    );

    return {
      ...d,
      x,
      y,
      outsideMin,
      outsideMax,
    };
  });
}

export function getSectionsAndNames(newData: KGItem[]) {
  const result: TopicSections = {};

  const sortedData = orderBy(newData, ['score'], ['desc']);

  sortedData.forEach(({ title, topic }) => {
    if (topic === undefined) return;

    if (topic.name in result) result[topic.name].push(title);
    else result[topic.name] = [title];
  });

  return result;
}
