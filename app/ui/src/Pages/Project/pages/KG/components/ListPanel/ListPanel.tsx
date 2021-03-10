import { D } from '../KGVisualization/KGVisualization';
import React from 'react';
import Score from '../KGVisualization/Score';
import { resourcesViz } from '../KGVisualization/KGViz';
import styles from './ListPanel.module.scss';

type Props = {
  resources: D[];
  onResourceClick: (d: D) => void;
  scores: [number, number];
};
function ListPanel({ resources, onResourceClick, scores }: Props) {
  const top25 = resources.slice(0, 25);

  function onEnter(name: string) {
    resourcesViz?.highlightResource(name);
  }

  function onLeave() {
    resourcesViz?.highlightResource(null);
  }

  function formatScore(score: number) {
    return `${Math.round(score * 100)}%`;
  }

  const [maxScore, minScore] = scores;

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {`Top 25 of resources between ${formatScore(
          maxScore
        )} and ${formatScore(minScore)} of score`}
      </div>
      <div className={styles.list}>
        {top25.map((r) => (
          <div
            className={styles.resource}
            onMouseEnter={() => onEnter(r.name)}
            onMouseLeave={onLeave}
            onClick={() => onResourceClick(r)}
          >
            <div className={styles.rTitle}>{r.name}</div>
            <div className={styles.typeAndScore}>
              <div className={styles.rType}>{r.type}</div>
              <Score value={r.score} />
            </div>
            <div className={styles.topics}>
              <div className={styles.topic}>{r.category}</div>
              <div className={styles.topic}>
                + {Math.round(Math.random() * 3)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListPanel;
