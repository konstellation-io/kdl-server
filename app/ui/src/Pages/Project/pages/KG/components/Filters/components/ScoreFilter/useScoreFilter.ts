import React, { useState } from 'react';

import { Scores } from './ScoreFilter';

const normalizer = 100;

export interface ScoreFilterProps {
  min?: number;
  max?: number;
  defaultMin?: number;
  defaultMax?: number;
  onUpdate: (score: Scores) => void;
}
function useScoreFilter({
  max = 100,
  defaultMin = 0,
  defaultMax = 100,
  onUpdate,
}: ScoreFilterProps) {
  const [scores, setScores] = useState<Scores>([defaultMin, defaultMax]);

  function setEdgeScores(numbers: [number, number]) {
    const topScore = (max - numbers[0]) / normalizer;
    const bottomScore = (max - numbers[1]) / normalizer;
    onUpdate([bottomScore, topScore]);
  }

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setScores(numbers as Scores);

  const handleSliderChangeCommitted = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => setEdgeScores(numbers as Scores);

  return {
    scores,
    handleSliderChange,
    handleSliderChangeCommitted,
  };
}

export default useScoreFilter;
