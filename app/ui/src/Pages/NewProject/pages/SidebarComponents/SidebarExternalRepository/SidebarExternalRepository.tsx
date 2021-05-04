import React from 'react';
import styles from '../SidebarComponents.module.scss';

const SidebarExternalRepository = () => (
  <div className={styles.sidebar}>
    <span>
      In this page you can set up the external repository information.
    </span>
    <span className={styles.line}>
      You should insert the HTTP(S) or GIT 'clone' URL of an existing
      repository, the username and the access token.
    </span>
    <span className={styles.line}>
      The token you generate depends on the code hosting service you are using.
      For example if you are using Github you can go to the <i>Settings</i> and
      then select <i>Developer Settings</i>, here you can generate a Github
      token.
    </span>
  </div>
);

export default SidebarExternalRepository;
