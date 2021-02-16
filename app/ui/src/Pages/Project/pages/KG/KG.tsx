import React, { useEffect, useState } from 'react';

import { Button } from 'kwc';
import Filters from './components/Filters/Filters';
import KGVisualization from './components/KGVisualization/KGVisualization';
import NavigationMenu from './components/NavigationMenu/NavigationMenu';
import data from './components/KGVisualization/data';
import styles from './KG.module.scss';

const DEFAULT_SCORE_FILTER: [number, number] = [0, 1];

function KG() {
  const [selectedResource, setSelectedResource] = useState('Project Name 1');
  const [mockData, setMockData] = useState(data);
  const [scoreFilter, setScoreFilter] = useState<[number, number]>(DEFAULT_SCORE_FILTER);
  
  const [min, max] = scoreFilter;

  useEffect(() => {
    setMockData(prev => prev.filter(d => d.score >= min && d.score <= max));
  }, [min, max]);

  function onResourceSelection(name: string) {
    alert(`Resource selected: ${name}`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.kgTopBar}>
        <NavigationMenu />
        <Filters />
      </div>
      <KGVisualization
        data={mockData}
        selectedResource={selectedResource}
        onResourceSelection={onResourceSelection}
      />
      <div style={{ position: 'absolute', bottom: 80, left: 50}}>
        <Button label="FILTER LOW" onClick={() => {
          setScoreFilter([min + 0.1, max]);
        }} primary />
      </div>
      <div style={{ position: 'absolute', bottom: 30, left: 50}}>
        <Button label="FILTER HIGH" onClick={() => {
          setScoreFilter([min, max - 0.1]);
        }} primary />
      </div>
      <div style={{ position: 'absolute', bottom: 130, left: 50}}>
        <Button label="CHANGE RESOURCE" onClick={() => {
          setSelectedResource('Another interesting paper');
        }} primary />
      </div>
    </div>
  );
}

export default KG;
