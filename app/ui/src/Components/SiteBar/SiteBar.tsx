import { Left, Right } from 'kwc';
import React from 'react';

import ArrowsNavigator from './components/ArrowsNavigator/ArrowsNavigator';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import styles from './SiteBar.module.scss';
import isElectron from 'is-electron';

const SiteBar = () => (
  <div className={styles.container}>
    <Left className={styles.left}>
      <>
        {isElectron() && <ArrowsNavigator />}
        <Breadcrumbs />
      </>
    </Left>
    <Right className={styles.right}>
      <SettingsMenu />
    </Right>
  </div>
);

export default SiteBar;
