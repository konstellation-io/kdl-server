import React, { Dispatch, SetStateAction, useState } from 'react';
import { Scores } from './ScoreFilter';

const normalizer = 100;

export interface PreviewScore {
  shouldAdd: boolean;
  prevScore: number;
  score: number;
}

export interface ScoreFilterProps {
  min?: number;
  max?: number;
  defaultMin?: number;
  defaultMax?: number;
  onUpdate: (score: Scores) => void;
  onChange: Dispatch<SetStateAction<PreviewScore | null>>;
}
function useScoreFilter({
  max = 100,
  defaultMin = 0,
  defaultMax = 100,
  onUpdate,
  onChange,
}: ScoreFilterProps) {
  const [scores, setScores] = useState<Scores>([defaultMin, defaultMax]);
  const [committedScores, setCommittedScores] = useState<Scores>([
    defaultMin,
    defaultMax,
  ]);

  function setEdgeScores(numbers: Scores) {
    setCommittedScores(numbers);
    const topScore = (max - numbers[0]) / normalizer;
    const bottomScore = (max - numbers[1]) / normalizer;
    onUpdate([bottomScore, topScore]);
  }

  function getPreviewScore(newScores: Scores): PreviewScore {
    const [lastBottom, lastTop] = committedScores;
    const [newBottom, newTop] = newScores;
    const shouldAdd = lastTop - lastBottom < newTop - newBottom;
    const isBottomChanged = lastBottom !== newBottom;
    const scoreIdx = isBottomChanged ? 0 : 1;
    return {
      shouldAdd,
      prevScore: max - committedScores[scoreIdx],
      score: max - newScores[scoreIdx],
    };
  }

  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => {
    const newScores = numbers as Scores;
    const previewScore: PreviewScore = getPreviewScore(newScores);
    onChange(previewScore);
    setScores(newScores);
  };

  const handleSliderChangeCommitted = (
    _: React.ChangeEvent<{}>,
    numbers: number | number[]
  ) => {
    setEdgeScores(numbers as Scores);
    onChange(null);
  };

  return {
    scores,
    handleSliderChange,
    handleSliderChangeCommitted,
  };
}

export default useScoreFilter;
