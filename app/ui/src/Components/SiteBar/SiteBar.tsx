import { ExpandableTextInput, Left, Right } from 'kwc';
import React, { useEffect } from 'react';

import ArrowsNavigator from './components/ArrowsNavigator/ArrowsNavigator';
import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import styles from './SiteBar.module.scss';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import useProjectFilters from 'Graphql/client/hooks/useProjectFilters';

type FormData = {
  projectName: string;
};

function SiteBar() {
  const { goBack, goForward } = useHistory();
  const { updateFilters } = useProjectFilters();
  const { setValue, unregister, register, watch } = useForm<FormData>({
    defaultValues: { projectName: '' },
  });

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
        <ArrowsNavigator onBackClick={goBack} onForwardClick={goForward} />
        <Breadcrumbs />
      </Left>
      <Right className={styles.right}>
        <SettingsMenu />
      </Right>
    </div>
  );
}

export default SiteBar;
