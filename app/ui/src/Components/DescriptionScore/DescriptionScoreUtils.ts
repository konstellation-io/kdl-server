export enum ScoreLevels {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export function getScoreLevel(score: number) {
  let selectedLevel: ScoreLevels;

  switch (true) {
    case score >= 20 && score < 70:
      selectedLevel = ScoreLevels.MEDIUM;
      break;
    case score >= 70 && score < 90:
      selectedLevel = ScoreLevels.HIGH;
      break;
    case score >= 90:
      selectedLevel = ScoreLevels.VERY_HIGH;
      break;
    default:
      selectedLevel = ScoreLevels.LOW;
  }

  return selectedLevel;
}

export const scoreText = new Map([
  [ScoreLevels.LOW, 'Description is incomplete for Knowledge Galaxy.'],
  [ScoreLevels.MEDIUM, 'Please, write some more text in description.'],
  [ScoreLevels.HIGH, 'Your description is good enough to be indexed.'],
  [ScoreLevels.VERY_HIGH, 'Nice, your description is fully indexable.'],
]);

export const levels = Object.keys(ScoreLevels);
