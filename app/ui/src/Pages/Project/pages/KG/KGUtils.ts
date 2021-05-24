import {
  CoordData,
  CoordOptions,
  CoordOut,
  D,
} from './components/KGVisualization/Viz/KGViz';

import { KGItem } from './KG';
import { orderBy } from 'lodash';
import { KnowledgeGraphItemCat } from 'Graphql/types/globalTypes';

export interface TopicSections {
  [key: string]: string[];
}

export type Coord = {
  x: number;
  y: number;
};

export interface DComplete extends D {
  x: number;
  y: number;
  outsideMin: boolean;
  outsideMax: boolean;
  distanceToCenter: number; // 0-1
}

export const categoryToLabel: {
  [key in keyof typeof KnowledgeGraphItemCat]: string;
} = {
  [KnowledgeGraphItemCat.Code]: 'Paper with Code',
  [KnowledgeGraphItemCat.Paper]: 'Paper',
};

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

    const { x, y, distanceToCenter } = coord(
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
      distanceToCenter,
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
