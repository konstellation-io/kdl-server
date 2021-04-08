import { useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { D } from './Viz/KGViz';
import { useReactiveVar } from '@apollo/client';
import { kgScore } from '../../../../../../Graphql/client/cache';
import useKGFilters from '../../../../../../Graphql/client/hooks/useKGFilters';

function useKGVizScores(data: D[]) {
  const scores = useReactiveVar(kgScore);
  const [borderScores, setBorderScores] = useState<[number, number]>([1, 0]);

  const { updateScore } = useKGFilters();
  const [animating, setAnimating] = useState(true);

  const allScores = data.map((d) => d.score);

  useEffect(() => {
    if (animating && data) {
      const mn2 = Math.min(...allScores);
      const mx2 = Math.max(...allScores);

      const difMin = mn2;
      const difMax = 1 - mx2;

      // @ts-ignore
      select('body')
        .transition()
        .duration(1000)
        .delay(500)
        .attrTween('fill', () => (t) => {
          updateScore([1 - difMax * t, difMin * t]);
          return t;
        })
        .on('end', () => setAnimating(false));
    }
  }, [data]);

  // Resets scores when getting new data
  useEffect(() => {
    if (!allScores.length) return;

    const min = Math.min(...allScores);
    const max = Math.max(...allScores);
    if (!animating) {
      updateScore([max, min]);
    }
    setBorderScores([max + 0.01, 0]);
  }, [data, animating]);

  function zoomScore(zoomAmount: number, pivotPosition: number) {
    const [max, min] = scores;
    const [maxScore, minScore] = borderScores;

    const diff = max - min;
    const rev = 1 / diff;

    const scoreFactorMin = 1 - pivotPosition;
    const scoreFactorMax = pivotPosition;

    // const deltaYNormalized = -(e.deltaY / height) / 10;

    const dScore: number = zoomAmount / (500 * rev); // 50 000
    // const dScore: number = deltaYNormalized; // 50 000

    const newMin = Math.min(
      max,
      Math.max(minScore, min + dScore * scoreFactorMin)
    );
    const newMax = Math.max(
      newMin + 0.0001,
      Math.min(maxScore, max - dScore * scoreFactorMax)
    );

    updateScore([newMax, newMin]);
  }

  function dragScore(dragAmount: number, pivotScores: [number, number]) {
    const [max, min] = pivotScores;
    const scoresDistance = max - min;

    let newMax = max + dragAmount;

    const [limitMax] = borderScores;

    newMax = Math.min(limitMax, newMax);
    const newMin = newMax - scoresDistance;

    updateScore([newMax, newMin]);
  }

  return { scores, zoomScore, dragScore };
}

export default useKGVizScores;
