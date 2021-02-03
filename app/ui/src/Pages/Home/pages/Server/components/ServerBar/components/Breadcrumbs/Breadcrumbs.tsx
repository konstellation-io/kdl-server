import React from 'react';
import styles from './Breadcrumbs.module.scss';
import Crumb from './components/Crumb/Crumb';
import useBreadcrumbs from './useBreadcrumbs';

function Breadcrumbs() {
  const { crumbs } = useBreadcrumbs();
  return (
    <div className={styles.container}>
      {crumbs.map((crumb, index) => (
        <Crumb {...crumb} key={index} />
      ))}
    </div>
  );
}

export default Breadcrumbs;
