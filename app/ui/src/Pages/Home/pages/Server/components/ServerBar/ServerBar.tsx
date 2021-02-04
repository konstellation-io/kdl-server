import { ExpandableTextInput, Left, Right } from 'kwc';
import React, { useEffect } from 'react';

import SettingsMenu from '../SettingsMenu/SettingsMenu';
import styles from './ServerBar.module.scss';
import { useForm } from 'react-hook-form';
import { useHistory, useRouteMatch } from 'react-router-dom';
import useProjectFilters from 'Pages/Home/apollo/hooks/useProjectFilters';
import ArrowsNavigator from './components/ArrowsNavigator/ArrowsNavigator';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import ROUTE from 'Constants/routes';

type FormData = {
  projectName: string;
};

const isElectron = /electron/i.test(navigator.userAgent);

function ServerBar() {
  const { goBack, goForward } = useHistory();
  const isHome = useRouteMatch({
    path: ROUTE.HOME,
    strict: true,
  });
  const { updateFilters } = useProjectFilters();
  const { setValue, unregister, register, watch } = useForm<FormData>({
    defaultValues: { projectName: '' },
  });

  function getBackBehavior() {
    let handleGoBack = goBack;
    if (isElectron && isHome?.isExact) {
      const { ipcRenderer } = window.require('electron');
      handleGoBack = () => ipcRenderer.send('closeServer');
    }
    return handleGoBack;
  }
  useEffect(() => {
    register('projectName');
    return () => unregister('projectName');
  }, [register, unregister, setValue]);

  const projectName = watch('projectName');
  useEffect(() => {
    updateFilters({
      name: projectName,
    });
  }, [projectName, updateFilters]);

  return (
    <div className={styles.container}>
      <Left className={styles.left}>
        <ArrowsNavigator
          onBackClick={getBackBehavior()}
          onForwardClick={goForward}
        />
        <Breadcrumbs />
      </Left>
      <Right className={styles.right}>
        <ExpandableTextInput
          onChange={(value: string) => setValue('projectName', value)}
          className={styles.formSearch}
        />
        <SettingsMenu />
      </Right>
    </div>
  );
}

export default ServerBar;
