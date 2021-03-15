import { D } from '../KGVisualization';
import IconMouse from '@material-ui/icons/Mouse';
import React from 'react';
import Score from '../Score';
import cx from 'classnames';
import styles from './ResourceTooltip.module.scss';

type Props = {
  resource: D | null;
};
function ResourceTooltip({ resource }: Props) {
  function getContent() {
    if (resource === null)
      return (
        <div className={styles.help}>
          <IconMouse className="icon-regular" />
          <span>Click on a resource to see its details.</span>
        </div>
      );

    return (
      <>
        <div className={styles.left}>
          <div className={styles.icon} />
          <div className={styles.name}>{resource.name}</div>
        </div>
        <div className={styles.score}>
          <Score value={resource.score} />
        </div>
      </>
    );
  }
  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: resource !== null,
      })}
    >
      {getContent()}
    </div>
  );
}

export default ResourceTooltip;
