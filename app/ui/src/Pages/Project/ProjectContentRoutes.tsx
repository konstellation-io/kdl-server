import { Redirect, Route, Switch } from 'react-router-dom';

import KG from './pages/KG/KG';
import Overview from './pages/Overview/Overview';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { useMemo } from 'react';
import { ProjectRoute } from './ProjectPanels';
import ProjectToolsRoutes from './components/ProjectToolsRoutes/ProjectToolsRoutes';
import { useQuery } from '@apollo/client';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { loader } from 'graphql.macro';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

function ProjectContentRoutes({ openedProject }: ProjectRoute) {
  const { data } = useQuery<GetMe>(GetMeQuery);
  const areToolsActive = data?.me.areToolsActive;
  const overviewRoute = useMemo(
    () => buildRoute(ROUTE.PROJECT_OVERVIEW, openedProject.id),
    [openedProject]
  );

  return (
    <Switch>
      <Redirect exact from={ROUTE.PROJECT} to={overviewRoute} />
      {!areToolsActive && (
        <>
          {[ROUTE.PROJECT_TOOL_JUPYTER, ROUTE.PROJECT_TOOL_VSCODE].map((r) => (
            <Redirect key={r} from={r} to={overviewRoute} />
          ))}
        </>
      )}

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
