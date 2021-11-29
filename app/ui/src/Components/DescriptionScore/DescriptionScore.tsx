import React, { memo, useEffect, useState } from 'react';
import { ScoreLevels, getScoreLevel, levels, scoreText } from './DescriptionScoreUtils';

import { SpinnerLinear } from 'kwc';
import cx from 'classnames';
import styles from './DescriptionScore.module.scss';

type Props = {
  score: number;
  loading?: boolean;
};

function DescriptionScore({ score, loading = false }: Props) {
  const [scoreLevel, setScoreLevel] = useState(ScoreLevels.LOW);
  const [scoreIndex, setScoreIndex] = useState(0);

  useEffect(() => {
    const selectedLevel = getScoreLevel(score);
    const selectedScoreIndex = levels.indexOf(selectedLevel);

    setScoreLevel(selectedLevel);
    setScoreIndex(selectedScoreIndex);
  }, [score]);

  function renderScoreLevels() {
    return levels.map((level, index) => (
      <div
        key={level}
        className={cx(styles.scoreLevel, {
          [styles[scoreLevel]]: !loading && index <= scoreIndex,
        })}
      />
    ));
  }

  function getScoreValue() {
    if (loading) return <SpinnerLinear size={40} />;

    return `${score}%`;
  }

  function getScoreDescription() {
    return loading ? 'Computing new description score...' : scoreText.get(scoreLevel);
  }

  return (
    <div className={styles.container}>
      <span className={cx(styles.scoreLabel, styles[scoreLevel])}>{getScoreValue()}</span>
      <div className={styles.scoreLevels}>{renderScoreLevels()}</div>
      <span className={styles.hintLabel}>{getScoreDescription()}</span>
    </div>
  );
}

export default memo(DescriptionScore);
