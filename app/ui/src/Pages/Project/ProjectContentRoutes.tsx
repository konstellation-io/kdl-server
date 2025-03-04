import React from 'react';
import ROUTE from 'Constants/routes';
import { Redirect, Route, Switch } from 'react-router-dom';

import Overview from './pages/Overview/Overview';
import ProjectToolsRoutes from './components/ProjectToolsRoutes/ProjectToolsRoutes';

import { CONFIG } from 'index';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';

export interface ProjectRoute {
  openedProject: GetProjects_projects;
}

function ProjectContentRoutes({ openedProject }: ProjectRoute) {
  function redirectIfArchived() {
    return openedProject.archived && <Redirect from={ROUTE.PROJECT} to={ROUTE.PROJECTS} />;
  }

  function redirectIfDeleted() {
    return !openedProject && <Redirect from={ROUTE.PROJECT} to={ROUTE.PROJECTS} />;
  }

  function redirectDisabledKG() {
    return (
      !CONFIG.KNOWLEDGE_GALAXY_ENABLED && (
        <Redirect key={ROUTE.PROJECT_TOOL_KG} from={ROUTE.PROJECT_TOOL_KG} to={ROUTE.PROJECT_OVERVIEW} />
      )
    );
  }

  return (
    <Switch>
      <Redirect exact from={ROUTE.PROJECT} to={ROUTE.PROJECT_OVERVIEW} />

      {redirectIfArchived()}
      {redirectIfDeleted()}
      {redirectDisabledKG()}

      <Route exact path={ROUTE.PROJECT_OVERVIEW} component={() => <Overview openedProject={openedProject} />} />
      <Route path={ROUTE.PROJECT_TOOL} component={ProjectToolsRoutes} />
    </Switch>
  );
}

export default ProjectContentRoutes;
