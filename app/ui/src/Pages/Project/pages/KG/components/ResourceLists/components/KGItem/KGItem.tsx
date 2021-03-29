import React, { FC } from 'react';

import { D } from '../../../KGVisualization/KGVisualization';
import IconStar from '@material-ui/icons/Star';
import IconTime from '@material-ui/icons/AccessTime';
import Score from '../../../KGVisualization/Score';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './KGItem.module.scss';
import { GetKnowledgeGraph_knowledgeGraph_items_topics } from 'Graphql/queries/types/GetKnowledgeGraph';

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
  const fullResource = idToFullResource[resource.id];
  const allTopicsButFirst = fullResource.topics
    .slice(1)
    .map((t: GetKnowledgeGraph_knowledgeGraph_items_topics) => t.name);

  return (
    <div
      key={resource.id}
      className={cx(styles.resource, { [styles.starred]: resource.starred })}
      onMouseEnter={() => onEnter(resource.name)}
      onMouseLeave={onLeave}
      onClick={() => onClick(resource)}
    >
      <div className={styles.typeAndScore}>
        <div className={styles.rTypeWrapper}>
          <div className={styles.timeField}>
            <IconTime className="icon-regular" />
            <span className={styles.rType}>
              {formatDate(fullResource.date)}
            </span>
          </div>
          {fullResource.topics.length !== 0 && (
            <div className={styles.topics}>
              <span className={styles.topic} title={resource.category}>
                {resource.category}
              </span>
              {fullResource.topics.length > 1 && (
                <span
                  className={styles.topic}
                  title={allTopicsButFirst.join('\n')}
                >
                  + {fullResource.topics.length - 1}
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
        {resource.name}
      </div>
      <div className={styles.rCategory}>{resource.type}</div>
    </div>
  );
};

export default KGItem;
