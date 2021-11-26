import * as React from 'react';
import styles from './Breadcrumbs.module.scss';
import { useRouteMatch } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import ServerCrumb from './components/ServerCrumb/ServerCrumb';
import ProjectsCrumb from './components/ProjectsCrumbs/ProjectsCrumb';
import ProjectCrumb from './components/ProjectCrumbs/ProjectCrumb';

function Breadcrumbs() {
  const isProjectRoute = useRouteMatch(ROUTE.PROJECT);

  return (
    <div className={styles.container}>
      <ServerCrumb />
      {isProjectRoute && (
        <>
          <ProjectsCrumb />
          <ProjectCrumb />
        </>
      )}
    </div>
  );
}

export default Breadcrumbs;
