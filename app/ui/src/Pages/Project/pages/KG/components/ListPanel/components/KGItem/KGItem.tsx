import React, { FC } from 'react';
import { D } from '../../../KGVisualization/KGVisualization';
import styles from './KGItem.module.scss';
import Score from '../../../KGVisualization/Score';
import cx from 'classnames';

type Props = {
  resource: D;
  onClick: (resource: D) => void;
  onEnter?: (name: string) => void;
  onLeave?: () => void;
  isStarred?: boolean;
};
const KGItem: FC<Props> = ({
  resource,
  onClick,
  onLeave = () => {},
  onEnter = () => {},
  isStarred = false,
}: Props) => (
  <div
    key={resource.name}
    className={cx(styles.resource, { [styles.starred]: isStarred })}
    onMouseEnter={() => onEnter(resource.name)}
    onMouseLeave={onLeave}
    onClick={() => onClick(resource)}
  >
    <div className={styles.typeAndScore}>
      <div className={styles.rTypeWrapper}>
        <span className={styles.rType}>{resource.type}</span>
        <div className={styles.topics}>
          <span className={styles.topic}>{resource.category}</span>
          <span className={styles.topic}>
            + {Math.round(Math.random() * 3)}
          </span>
        </div>
      </div>
      <Score value={resource.score} />
    </div>
    <div className={styles.rTitle}>{resource.name}</div>
    <div className={styles.rCategory}>Category: {resource.category}</div>
  </div>
);

export default KGItem;
