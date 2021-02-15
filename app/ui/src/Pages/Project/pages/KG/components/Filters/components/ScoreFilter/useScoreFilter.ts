import { useEffect, useState } from 'react';

export interface ScoreFilterProps {
  max?: number;
  initialMin?: number;
  initialMax?: number;
}
function useScoreFilter({
  max = 100,
  initialMin = 0,
  initialMax = 100,
}: ScoreFilterProps) {
  const [scores, setScores] = useState<number[]>([initialMin, initialMax]);
  const [topScore, setTopScore] = useState(max - scores[0]);
  const [bottomScore, setBottomScore] = useState(max - scores[1]);

  function setEdgeScores(numbers: [number, number]) {
    setTopScore(max - numbers[0]);
    setBottomScore(max - numbers[1]);
  }

  return { setScores, topScore, bottomScore, scores, setEdgeScores };
}

export default useScoreFilter;
