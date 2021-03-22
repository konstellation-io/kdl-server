import React from 'react';
import { stringToId } from 'Utils/d3';
import styles from './SectionList.module.scss';

type Props = {
  section: string;
  idx: number;
};
function SectionList({ section, idx }: Props) {
  return (
    <div id={`kg_${stringToId(section)}`} className={styles.container}>
      <div className={styles.position}>{idx + 1}</div>
      <div className={styles.section}>{section}</div>
    </div>
  );
}

export default SectionList;
