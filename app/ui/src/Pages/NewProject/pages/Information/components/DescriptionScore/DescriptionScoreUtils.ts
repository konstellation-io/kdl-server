export enum ScoreLevels {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export function getScoreLevel(score: number) {
  let selectedLevel: ScoreLevels;

  switch(true) {
    case score >= 25 && score < 50:
      selectedLevel = ScoreLevels.MEDIUM;
      break;
    case score >= 50 && score < 75:
      selectedLevel = ScoreLevels.HIGH;
      break;
    case score >= 75:
      selectedLevel = ScoreLevels.VERY_HIGH;
      break;
    default:
      selectedLevel = ScoreLevels.LOW;
  }

  return selectedLevel;
}

export const scoreText = new Map([
  [ScoreLevels.LOW, 'Description is incomplete for Knowledge Graph.'],
  [ScoreLevels.MEDIUM, 'Please, write some more text in description.'],
  [ScoreLevels.HIGH, 'Your description is good enough to be indexed.'],
  [ScoreLevels.VERY_HIGH, 'Nice, your description is fully indexable.'],
]);

export const levels = Object.keys(ScoreLevels);
