import ROUTE, { RouteProjectParams } from 'Constants/routes';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import { GetMe } from 'Graphql/queries/types/GetMe';
import KG from './pages/KG/KG';
import Overview from './pages/Overview/Overview';
import ProjectToolsRoutes from './components/ProjectToolsRoutes/ProjectToolsRoutes';
import React from 'react';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import {
  GetProject,
  GetProjectVariables,
} from '../../Graphql/queries/types/GetProject';
import { ErrorMessage, SpinnerCircular } from 'kwc';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');
const GetProjectQuery = loader('Graphql/queries/getProject.graphql');

function ProjectContentRoutes() {
  const { projectId } = useParams<RouteProjectParams>();

  const { data, error, loading } = useQuery<GetProject, GetProjectVariables>(
    GetProjectQuery,
    {
      variables: {
        id: projectId,
      },
    }
  );
  const { data: dataMe } = useQuery<GetMe>(GetMeQuery);

  if (loading || !data || !dataMe) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const areToolsActive = dataMe.me.areToolsActive;

  function redirectIfArchived() {
    return (
      data?.project.archived && (
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
        component={() => <Overview openedProject={data.project} />}
      />
      <Route path={ROUTE.PROJECT_TOOL} component={ProjectToolsRoutes} />
      <Route
        exact
        path={ROUTE.PROJECT_KG}
        component={() => <KG openedProject={data.project} />}
      />
    </Switch>
  );
}

export default ProjectContentRoutes;
