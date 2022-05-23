import * as React from 'react';
import styles from '../SidebarComponents.module.scss';

const SidebarRepository = () => (
  <div className={styles.sidebar}>
    <p className={styles.line}>In this page you can choose the type of repository you want.</p>
    <p className={styles.line}>We provide two types of repos:</p>
    <ol className={styles.repoList}>
      <li>
        <strong>External repo:</strong> use a version-control system located outside the server.
      </li>
    </ol>
  </div>
);

export default SidebarRepository;
