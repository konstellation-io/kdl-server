import KGVisualization from './components/KGVisualization/KGVisualization';
import React from 'react';
import styles from './KG.module.scss';

function KG() {
  return (
    <div className={styles.container}>
      <KGVisualization />
    </div>
  );
}

export default KG;
