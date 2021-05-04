import React from 'react';
import styles from './SidebarInformation.module.scss';

const SidebarInformation = () => (
  <div className={styles.infoSidebar}>
    <span>
      In this page you should fill with accuracy the description field.
    </span>
    <span className={styles.line}>
      This is a key field for the Konstellation environment because it is used
      to generate the Knowledge Galaxy.
    </span>
    <span className={styles.line}>
      This is like a real galaxy of papers (some of them with code included),
      its aim is to provide a better search process of papers related with your
      work. So if you want the Knowledge Galaxy helps you to find the best
      papers related to your project you should provide us a detailed
      description of it.
    </span>
    <span className={styles.line}>
      Remember: the better the description the better will be the indexes of
      papers in the Galaxy.
    </span>
  </div>
);

export default SidebarInformation;
