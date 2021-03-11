import {
  CoordData,
  CoordOptions,
  CoordOut,
} from './components/KGVisualization/KGViz';
import { D, TopicSections } from './components/KGVisualization/KGVisualization';
import { RGBColor, color } from 'd3-color';

import { GetKnowledgeGraph_knowledgeGraph_items } from 'Graphql/queries/types/GetKnowledgeGraph';
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
  if (outsideMax) return -10;

  return 0;
}

export function groupData(
  data: D[],
  coord: (
    { category, score, name }: CoordData,
    options: CoordOptions
  ) => CoordOut,
  minScore: number = 0,
  maxScore: number = 1
): DComplete[] {
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

export function getSectionsAndNames(newData: D[]) {
  const result: TopicSections = {};

  const sortedData = orderBy(newData, ['score'], ['desc']);

  sortedData.forEach(({ name, category }) => {
    if (category in result) result[category].push(name);
    else result[category] = [name];
  });

  return result;
}

export function buildKGItem({
  score,
  category,
  title,
  id,
}: GetKnowledgeGraph_knowledgeGraph_items): D {
  return {
    id,
    category: 'Others',
    name: title,
    type: category,
    score,
  };
}
