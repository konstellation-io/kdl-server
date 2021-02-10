import { Redirect, Route, Switch } from 'react-router-dom';

import KG from './pages/KG/KG';
import Overview from './pages/Overview/Overview';
import ROUTE from 'Constants/routes';
import React from 'react';
import Tools from './pages/Tools/Tools';

function ProjectContentRoutes() {
  return (
    <Switch>
      <Redirect exact from={ROUTE.PROJECT} to={ROUTE.PROJECT_OVERVIEW} />

      <Route exact path={ROUTE.PROJECT_OVERVIEW} component={Overview} />
      <Route exact path={ROUTE.PROJECT_TOOLS} component={Tools} />
      <Route exact path={ROUTE.PROJECT_KG} component={KG} />
    </Switch>
  );
}

export default ProjectContentRoutes;
