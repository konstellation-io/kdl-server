import { Redirect, Route, Switch } from 'react-router-dom';

import KG from './pages/KG/KG';
import Overview from './pages/Overview/Overview';
import ROUTE from 'Constants/routes';
import React from 'react';
import { ProjectRoute } from './ProjectPanels';
import ProjectToolsRoutes from './components/ProjectToolsRoutes/ProjectToolsRoutes';

function ProjectContentRoutes({ openedProject }: ProjectRoute) {
  return (
    <Switch>
      <Redirect exact from={ROUTE.PROJECT} to={ROUTE.PROJECT_OVERVIEW} />

      <Route exact path={ROUTE.PROJECT_OVERVIEW} component={Overview} />
      <Route path={ROUTE.PROJECT_TOOL} component={ProjectToolsRoutes} />
      <Route
        exact
        path={ROUTE.PROJECT_KG}
        component={() => <KG openedProject={openedProject} />}
      />
    </Switch>
  );
}

export default ProjectContentRoutes;
