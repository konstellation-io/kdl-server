import React from 'react';

import IconStar from '@material-ui/icons/Star';
import IconTime from '@material-ui/icons/AccessTime';
import { KGItem as KGItemType } from 'Pages/Project/pages/KG/KG';
import Score from '../../../KGVisualization/Score/Score';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './KGItem.module.scss';
import { GetKnowledgeGraph_knowledgeGraph_items_topics } from 'Graphql/queries/types/GetKnowledgeGraph';

type Props = {
  resource: KGItemType;
  onClick: (resource: KGItemType) => void;
  onEnter?: (name: string) => void;
  onLeave?: () => void;
};

function KGItem({ resource, onClick, onLeave, onEnter }: Props) {
  const allTopicsButFirst = resource.topics
    .slice(1)
    .map((t: GetKnowledgeGraph_knowledgeGraph_items_topics) => t.name);

  return (
    <div
      key={resource.id}
      className={cx(styles.resource, { [styles.starred]: resource.starred })}
      onMouseEnter={() => onEnter && onEnter(resource.title)}
      onMouseLeave={onLeave}
      onClick={() => onClick(resource)}
    >
      <div className={styles.typeAndScore}>
        <div className={styles.rTypeWrapper}>
          <div className={styles.timeField}>
            <IconTime className="icon-regular" />
            <span className={styles.rType}>
              {formatDate(new Date(resource.date))}
            </span>
          </div>
          {resource.topics.length !== 0 && (
            <div className={styles.topics}>
              <span className={styles.topic} title={resource.topics[0].name}>
                {resource.topics[0].name}
              </span>
              {resource.topics.length > 1 && (
                <span
                  className={styles.topic}
                  title={allTopicsButFirst.join('\n')}
                >
                  + {resource.topics.length - 1}
                </span>
              )}
            </div>
          )}
        </div>
        <Score value={resource.score} />
      </div>
      <div className={styles.rTitle}>
        {resource.starred && (
          <div className={styles.starIcon}>
            <IconStar className="icon-small" />
          </div>
        )}
        {resource.title}
      </div>
      <div className={styles.rCategory}>{resource.category}</div>
    </div>
  );
}

export default KGItem;
