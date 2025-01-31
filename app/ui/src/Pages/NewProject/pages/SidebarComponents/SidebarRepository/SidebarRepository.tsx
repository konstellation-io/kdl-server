import * as React from 'react';
import styles from '../SidebarComponents.module.scss';

const SidebarRepository = () => (
  <div className={styles.sidebar}>
    <p className={styles.line}>In this page you can set up the external repository information.</p>
    <p className={styles.line}>
      {/* eslint-disable-next-line react/no-unescaped-entities */}
      You should insert the HTTP(S) or GIT 'clone' URL of an existing repository, the username and the access token.
    </p>
    <p className={styles.line}>
      The token you generate depends on the code hosting service you are using. For example if you are using Github you
      can go to the <i>Settings</i> and then select <i>Developer Settings</i>, here you can generate a Github token.
    </p>
  </div>
);

export default SidebarRepository;
