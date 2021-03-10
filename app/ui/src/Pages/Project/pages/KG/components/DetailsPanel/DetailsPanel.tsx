import { Button } from 'kwc';
import { D } from '../KGVisualization/KGVisualization';
import IconClose from '@material-ui/icons/Close';
import React from 'react';
import Score from '../KGVisualization/Score';
import styles from './DetailsPanel.module.scss';

type Props = {
  resource: D;
};
function DetailsPanel({ resource }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <div className={styles.titleText}>Detail</div>
        <Button Icon={IconClose} label="" />
      </div>
      <div className={styles.resourceTitleAndTopics}>
        <div className={styles.nameAndTopics}>
          <div className={styles.name}>{resource.name}</div>
          <div className={styles.topics}>{resource.category}</div>
        </div>
        <div className={styles.score}>
          <Score value={resource.score} />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.authors}>
          <div className={styles.sectionTitle}>AUTHORS</div>
          <div className={styles.authorsText}>A. B. C. and D. E. F.</div>
        </div>
        <div className={styles.type}>{resource.type}</div>
        <div className={styles.url}>www.google.es</div>
        <div className={styles.topicsG}>
          <div className={styles.sectionTitle}>TOPICS</div>
        </div>
      </div>
      <div className={styles.abstract}>afsdfffafaffafdfdafafaf</div>
    </div>
  );
}

export default DetailsPanel;
