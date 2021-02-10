import React, { useEffect, useState } from 'react';
import { ScoreLevels, getScoreLevel, levels, scoreText } from './DescriptionScoreUtils';

import cx from 'classnames';
import styles from './DescriptionScore.module.scss';

type Props = {
  score: number;
};

function DescriptionScore({ score }: Props) {
  const [scoreLevel, setScoreLevel] = useState(ScoreLevels.LOW);
  const [scoreIndex, setScoreIndex] = useState(0);

  useEffect(() => {
    let selectedLevel = getScoreLevel(score);
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

  return (
    <div className={styles.container}>
      <span className={cx(styles.scoreLabel, styles[scoreLevel])}>
        {score}%
      </span>
      <div className={styles.scoreLevels}>{renderScoreLevels()}</div>
      <span className={styles.hintLabel}>{scoreText.get(scoreLevel)}</span>
    </div>
  );
}

export default DescriptionScore;
