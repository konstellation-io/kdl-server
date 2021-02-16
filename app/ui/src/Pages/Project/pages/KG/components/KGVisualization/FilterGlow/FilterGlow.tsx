import React from 'react';
import styles from './FilterGlow.module.scss';

function FilterGlow() {
  return (
    <defs>
      <filter id="resourceGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />
        <feGaussianBlur in="thicken" stdDeviation="4" result="blurred" />
        <feFlood className={styles.glowFilter} result="glowColor" />
        <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
        <feMerge>
          <feMergeNode in="softGlow_colored"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  );
}

export default FilterGlow;
