import React from 'react';
import { stringToId } from 'Utils/d3';
import styles from './SectionList.module.scss';

type Props = {
  section: string;
};
function SectionList({ section }: Props) {
  return (
    <div id={`kg_${stringToId(section)}`} className={styles.container}>
      <div className={styles.section}>{section}</div>
    </div>
  );
}

export default SectionList;
