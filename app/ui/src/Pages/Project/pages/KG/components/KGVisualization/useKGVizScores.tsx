import { useEffect, useState } from 'react';
import { select } from 'd3-selection';
import { D } from './Viz/KGViz';

const ZOOM_STEP_SIZE = 100; // The lower the size the higher the number of steps are
const ZOOM_STEP_DIV = 8; // 100 / 8 = 12.5% -> amount of zoom that applies each step

function useKGVizScores(data: D[]) {
  const [scores, setScore] = useState<[number, number]>([1, 0]);
  // TODO: refactor using useMemo
  const [borderScores, setBorderScores] = useState<[number, number]>([1, 0]);

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
          setScore([1 - difMax * t, difMin * t]);
          return t;
        })
        .on('end', () => setAnimating(false));
    }
    // We want to execute this only when data updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Resets scores when getting new data
  useEffect(() => {
    if (!allScores.length) return;

    const min = Math.min(...allScores);
    const max = Math.max(...allScores);
    if (!animating) {
      setScore([max, min]);
    }
    setBorderScores([max + 0.01, 0]);
    // We want to reset scores only when data updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, animating]);

  function zoomScore(zoomAmountInPx: number, pivotPosition: number) {
    // pivot position is used to keep the mouse over the hovered element:
    //   if mouse is at min score, min score will not me affected by the zoom
    //   if mouse is at 25% from min score, a 25% of zoom will be applied to min score
    //     and a 75% to max score
    let scoreFactorMin = 1 - pivotPosition;
    let scoreFactorMax = pivotPosition;

    // Zooming while on edge will apply an inverted zoom to the closest value
    if (pivotPosition === 0) {
      scoreFactorMax = -0.1;
    } else if (pivotPosition === 1) {
      scoreFactorMin = -0.1;
    }

    const [maxScore, minScore] = borderScores;
    const [max, min] = scores;
    const diff = max - min;

    // Amount of zoom that each step applies (ex. 12.5% o a difference of 0.6 in scores)
    const zoomMultPerStep = diff / ZOOM_STEP_DIV;

    // Zooming in will decrease the distance between max and min zoom.
    const isZoomingIn = zoomAmountInPx > 0;
    const effectiveZoomMult = isZoomingIn
      ? 1 - zoomMultPerStep
      : 1 + zoomMultPerStep;

    // We apply the zoom multiplier nStep times. An step is a normalization of the scroll pixels.
    const nSteps = Math.ceil(Math.abs(zoomAmountInPx / ZOOM_STEP_SIZE));
    const totalMultiplier = Math.pow(effectiveZoomMult, nSteps) - 1;

    // Final multiplier is distributed between min and max scores
    const minMultiplier = totalMultiplier * scoreFactorMin;
    const maxMultiplier = totalMultiplier * scoreFactorMax;

    const newMin = Math.min(
      max,
      Math.max(minScore + 0.0001, min + min * minMultiplier)
    );
    const newMax = Math.max(
      newMin + 0.0001,
      Math.min(maxScore, max - max * maxMultiplier)
    );

    setScore([newMax, newMin]);
  }

  function dragScore(dragAmount: number, pivotScores: [number, number]) {
    const [max, min] = pivotScores;
    const scoresDistance = max - min;

    let newMax = max + dragAmount;

    const [limitMax] = borderScores;

    newMax = Math.min(limitMax, newMax);
    const newMin = Math.max(0, newMax - scoresDistance);

    setScore([newMax, newMin]);
  }

  return { scores, zoomScore, dragScore };
}

export default useKGVizScores;
