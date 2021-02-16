import KGVisualization from './components/KGVisualization/KGVisualization';
import React from 'react';
import styles from './KG.module.scss';
import Filters from './components/Filters/Filters';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';

function KG() {
  return (
    <div className={styles.container}>
      <div className={styles.kgTopBar}>
        <NavigationMenu />
        <Filters />
      </div>
      <KGVisualization />
    </div>
  );
}

export default KG;
