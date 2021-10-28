import ROUTE from 'Constants/routes';
import { Redirect, Route, Switch } from 'react-router-dom';

import { GetMe } from 'Graphql/queries/types/GetMe';
import Overview from './pages/Overview/Overview';
import { ProjectRoute } from './ProjectPanels';
import ProjectToolsRoutes from './components/ProjectToolsRoutes/ProjectToolsRoutes';
import React from 'react';
import { useQuery } from '@apollo/client';

import GetMeQuery from 'Graphql/queries/getMe';

function ProjectContentRoutes({ openedProject }: ProjectRoute) {
  const { data } = useQuery<GetMe>(GetMeQuery);
  const areToolsActive = data?.me.areToolsActive;

  function redirectIfArchived() {
    return (
      openedProject.archived && (
        <Redirect from={ROUTE.PROJECT} to={ROUTE.PROJECTS} />
      )
    );
  }

  function redirectIfToolsActives() {
    return (
      !areToolsActive &&
      [ROUTE.PROJECT_TOOL_JUPYTER, ROUTE.PROJECT_TOOL_VSCODE].map((r) => (
        <Redirect key={r} from={r} to={ROUTE.PROJECT_OVERVIEW} />
      ))
    );
  }

  return (
    <Switch>
      <Redirect exact from={ROUTE.PROJECT} to={ROUTE.PROJECT_OVERVIEW} />

      {redirectIfArchived()}
      {redirectIfToolsActives()}

      <Route
        exact
        path={ROUTE.PROJECT_OVERVIEW}
        component={() => <Overview openedProject={openedProject} />}
      />
      <Route path={ROUTE.PROJECT_TOOL} component={ProjectToolsRoutes} />
    </Switch>
  );
}

export default ProjectContentRoutes;
