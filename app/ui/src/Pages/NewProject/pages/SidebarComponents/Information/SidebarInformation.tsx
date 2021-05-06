import React from 'react';
import styles from '../SidebarComponents.module.scss';

const SidebarInformation = () => (
  <div className={styles.sidebar}>
    <p className={styles.line}>
      In this page you should fill with accuracy the description field.
    </p>
    <p className={styles.line}>
      This is a key field for the Konstellation environment because it is used
      to generate the Knowledge Galaxy.
    </p>
    <p className={styles.line}>
      This is like a real galaxy of papers (some of them with code included),
      its aim is to provide a better search process of papers related with your
      work. So if you want the Knowledge Galaxy helps you to find the best
      papers related to your project you should provide us a detailed
      description of it.
    </p>
    <p className={styles.line}>
      Remember: the better the description the better will be the indexes of
      papers in the Galaxy.
    </p>
  </div>
);

export default SidebarInformation;
