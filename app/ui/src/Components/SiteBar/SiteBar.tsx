import { Left, Right } from 'kwc';
import * as React from 'react';

import ArrowsNavigator from './components/ArrowsNavigator/ArrowsNavigator';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import styles from './SiteBar.module.scss';
import isElectron from 'is-electron';
import RuntimesCrumb from './components/Breadcrumbs/components/RuntimesCrumbs/RuntimesCrumb';
import CapabilitiesCrumb from './components/Breadcrumbs/components/CapabilitiesCrumbs/CapabilitiesCrumb';

const SiteBar = () => (
  <div className={styles.container}>
    <Left className={styles.left}>
      <>
        {isElectron() && <ArrowsNavigator />}
        <Breadcrumbs />
      </>
    </Left>
    <Right className={styles.right}>
      <RuntimesCrumb title={'Runtimes'} />
      <CapabilitiesCrumb title={'Capabilities'} />
      <SettingsMenu />
    </Right>
  </div>
);

export default SiteBar;
