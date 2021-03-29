import React, { FC } from 'react';

import IconStar from '@material-ui/icons/Star';
import IconTime from '@material-ui/icons/AccessTime';
import { KGItem as KGItemType } from 'Pages/Project/pages/KG/KG';
import Score from '../../../KGVisualization/Score';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './KGItem.module.scss';

type Props = {
  resource: KGItemType;
  onClick: (resource: KGItemType) => void;
  onEnter: (name: string) => void;
  onLeave: () => void;
};
const KGItem: FC<Props> = ({ resource, onClick, onLeave, onEnter }: Props) => {
  return (
    <div
      key={resource.id}
      className={cx(styles.resource, { [styles.starred]: resource.starred })}
      onMouseEnter={() => onEnter(resource.title)}
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
              <span className={styles.topic}>{resource.topics[0].name}</span>
              {resource.topics.length > 1 && (
                <span className={styles.topic}>
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
};

export default KGItem;
