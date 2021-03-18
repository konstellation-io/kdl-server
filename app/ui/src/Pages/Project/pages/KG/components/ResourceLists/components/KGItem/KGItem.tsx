import React, { FC } from 'react';

import { D } from '../../../KGVisualization/KGVisualization';
import IconTime from '@material-ui/icons/AccessTime';
import Score from '../../../KGVisualization/Score';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
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
  const fullResource = idToFullResource[resource.id];

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
          <div className={styles.timeField}>
            <IconTime className="icon-regular" />
            <span className={styles.rType}>
              {formatDate(fullResource.date)}
            </span>
          </div>
          {fullResource.topics.length !== 0 && (
            <div className={styles.topics}>
              <span className={styles.topic}>{resource.category}</span>
              {fullResource.topics.length > 1 && (
                <span className={styles.topic}>
                  + {fullResource.topics.length - 1}
                </span>
              )}
            </div>
          )}
        </div>
        <Score value={resource.score} />
      </div>
      <div className={styles.rTitle}>{resource.name}</div>
      <div className={styles.rCategory}>{resource.type}</div>
    </div>
  );
};

export default KGItem;
