import { ApolloClient, ApolloProvider } from '@apollo/client';
import React, { useEffect, useRef } from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';

import NewProject from './pages/NewProject/NewProject';
import NewUser from './pages/NewUser/NewUser';
import ProjectCreation from './pages/ProjectCreation/ProjectCreation';
import ROUTE from 'Constants/routes';
import cache from './apollo/cache';
import GenerateApiToken from './pages/GenerateApiToken/GenerateApiToken';
import history from 'browserHistory';
import Users from './pages/Server/pages/Users/Users';
import Projects from './pages/Server/pages/Projects/Projects';
import Project from './pages/Server/pages/Project/Project';
import UserSshKey from './pages/Server/pages/UserSshKey/UserSshKey';
import UserApiTokens from './pages/Server/pages/UserApiToken/UserApiTokens';
import ServerBar from './pages/Server/components/ServerBar/ServerBar';
import { CONFIG } from 'index';

function Home() {
  // Resets cache on exit client
  useEffect(
    () => () => {
      cache.reset();
    },
    []
  );

  const client = useRef(
    new ApolloClient({
      uri: `${CONFIG.KDL_ADMIN_API_HOST}/graphql`,
      credentials: 'include',
      cache,
    })
  );

  const routesWithTopBar = [
    ROUTE.USERS,
    ROUTE.HOME,
    ROUTE.PROJECT,
    ROUTE.USER_SSH_KEY,
    ROUTE.USER_API_TOKENS,
  ];

  return (
    <ApolloProvider client={client.current}>
      <Router history={history}>
        <Route path={routesWithTopBar} component={ServerBar} />
        <Switch>
          <Route exact path={ROUTE.NEW_PROJECT} component={NewProject} />
          <Route exact path={ROUTE.NEW_USER} component={NewUser} />
          <Route
            exact
            path={ROUTE.CREATION_PROJECT}
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
