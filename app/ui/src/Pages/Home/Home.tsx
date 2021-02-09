import { ApolloClient, ApolloProvider } from '@apollo/client';
import React, { useEffect } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';

import { CONFIG } from 'index';
import GenerateApiToken from './pages/GenerateApiToken/GenerateApiToken';
import NewProject from './pages/NewProject/NewProject';
import NewUser from './pages/NewUser/NewUser';
import Project from './pages/Server/pages/Project/Project';
import ProjectCreation from './pages/ProjectCreation/ProjectCreation';
import Projects from './pages/Server/pages/Projects/Projects';
import ROUTE from 'Constants/routes';
import ServerBar from './pages/Server/components/ServerBar/ServerBar';
import UserApiTokens from './pages/Server/pages/UserApiToken/UserApiTokens';
import UserSshKey from './pages/Server/pages/UserSshKey/UserSshKey';
import Users from './pages/Server/pages/Users/Users';
import cache from './apollo/cache';
import history from 'browserHistory';

function Home() {
  // Resets cache on exit client
  useEffect(
    () => () => {
      cache.reset();
    },
    []
  );

  const client = new ApolloClient({
    uri: `${CONFIG.KDL_ADMIN_API_URL}/api/query`,
    credentials: 'include',
    cache,
  });

  const routesWithTopBar = [
    ROUTE.USERS,
    ROUTE.HOME,
    ROUTE.PROJECT,
    ROUTE.USER_SSH_KEY,
    ROUTE.USER_API_TOKENS,
  ];

  return (
    <ApolloProvider client={client}>
      <Router history={history}>
        <Route path={routesWithTopBar} component={ServerBar} />
        <Switch>
          <Route exact path={ROUTE.NEW_PROJECT} component={NewProject} />
          <Route exact path={ROUTE.NEW_USER} component={NewUser} />
          <Route
            exact
            path={ROUTE.PROJECT_CREATION}
            component={ProjectCreation}
          />
          <Route
            exact
            path={ROUTE.GENERATE_USER_API_TOKEN}
            component={GenerateApiToken}
          />

          <Redirect exact from={ROUTE.PROJECT} to={ROUTE.PROJECT_OVERVIEW} />

          <Route exact path={ROUTE.USERS} component={Users} />
          <Route exact path={ROUTE.HOME} component={Projects} />
          <Route path={ROUTE.PROJECT} component={Project} />
          <Route exact path={ROUTE.USER_SSH_KEY} component={UserSshKey} />
          <Route exact path={ROUTE.USER_API_TOKENS} component={UserApiTokens} />
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default Home;
