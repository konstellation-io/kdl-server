import { CoordData, CoordOptions } from './components/KGVisualization/KGViz';

import { D } from './components/KGVisualization/KGVisualization';

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

export function getHash(text: string) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }

  return hash;
}

// TODO: improve performance and fix collisions
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
