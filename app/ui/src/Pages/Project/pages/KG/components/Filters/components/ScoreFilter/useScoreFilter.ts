import { useState } from 'react';

function useScoreFilter(min: number = 0, max: number = 100) {
  const [scores, setScores] = useState<number[]>([20, 80]);
  const topScore = max - scores[0];
  const bottomScore = max - scores[1];

  return { setScores, topScore, bottomScore, scores };
}

export default useScoreFilter;
