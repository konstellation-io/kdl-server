import React, { FC } from 'react';

import { D } from '../../../KGVisualization/KGVisualization';
import Score from '../../../KGVisualization/Score';
import cx from 'classnames';
import styles from './KGItem.module.scss';

type Props = {
  resource: D;
  onClick: (resource: D) => void;
  onEnter: (name: string) => void;
  onLeave: () => void;
  idToFullResource: { [key: string]: any };
};
const KGItem: FC<Props> = ({
  resource,
  onClick,
  onLeave,
  onEnter,
  idToFullResource,
}: Props) => {
  const topics = idToFullResource[resource.id].topics;

  return (
    <div
      key={resource.name}
      className={cx(styles.resource, { [styles.starred]: resource.starred })}
      onMouseEnter={() => onEnter(resource.name)}
      onMouseLeave={onLeave}
      onClick={() => onClick(resource)}
    >
      <div className={styles.typeAndScore}>
        <div className={styles.rTypeWrapper}>
          <span className={styles.rType}>{resource.type}</span>
          {topics.length !== 0 && (
            <div className={styles.topics}>
              <span className={styles.topic}>{resource.category}</span>
              {topics.length > 1 && (
                <span className={styles.topic}>+ {topics.length - 1}</span>
              )}
            </div>
          )}
        </div>
        <Score value={resource.score} />
      </div>
      <div className={styles.rTitle}>{resource.name}</div>
      <div className={styles.rCategory}>Category: {resource.category}</div>
    </div>
  );
};

export default KGItem;
