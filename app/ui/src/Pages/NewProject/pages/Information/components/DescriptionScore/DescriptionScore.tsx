import React, { useEffect, useState } from 'react';
import styles from './DescriptionScore.module.scss';
import cx from 'classnames';

enum ScoreLevels {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

type Props = {
  score: number;
};

const levels = Object.keys(ScoreLevels);

function DescriptionScore({ score }: Props) {
  const [scoreLevel, setScoreLevel] = useState(ScoreLevels.LOW);
  const [scoreIndex, setScoreIndex] = useState(0);

  useEffect(() => {
    let selectedLevel = ScoreLevels.LOW;
    if (score >= 25 && score < 50) selectedLevel = ScoreLevels.MEDIUM;
    else if (score >= 50 && score < 75) selectedLevel = ScoreLevels.HIGH;
    else if (score >= 75) selectedLevel = ScoreLevels.VERY_HIGH;

    const selectedScoreIndex = levels.indexOf(selectedLevel);

    setScoreLevel(selectedLevel);
    setScoreIndex(selectedScoreIndex);
  }, [score]);

  function renderScoreLevels() {
    return levels.map((level, index) => (
      <div
        key={level}
        className={cx(styles.scoreLevel, {
          [styles[scoreLevel]]: index <= scoreIndex,
        })}
      />
    ));
  }

  function renderHintLabel() {
    switch (scoreLevel) {
      case ScoreLevels.LOW:
        return 'Description is incomplete for Knowledge Graph.';
      case ScoreLevels.MEDIUM:
        return 'Please, write some more text in description.';
      case ScoreLevels.HIGH:
        return 'Your description is good enough to be indexed.';
      case ScoreLevels.VERY_HIGH:
        return 'Nice, your description is fully indexable.';
    }
  }

  return (
    <div className={styles.container}>
      <span className={cx(styles.scoreLabel, styles[scoreLevel])}>
        {score}%
      </span>
      <div className={styles.scoreLevels}>{renderScoreLevels()}</div>
      <span className={styles.hintLabel}>{renderHintLabel()}</span>
    </div>
  );
}

export default DescriptionScore;
