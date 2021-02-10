import { ApolloClient, ApolloProvider } from '@apollo/client';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';

import { CONFIG } from 'index';
import GenerateApiToken from 'Pages/GenerateApiToken/GenerateApiToken';
import NewProject from 'Pages/NewProject/NewProject';
import NewUser from 'Pages/NewUser/NewUser';
import Project from 'Pages/Server/pages/Project/Project';
import ProjectCreation from 'Pages/ProjectCreation/ProjectCreation';
import Projects from 'Pages/Server/pages/Projects/Projects';
import ROUTE from 'Constants/routes';
import React from 'react';
import ServerBar from 'Pages/Server/components/ServerBar/ServerBar';
import UserApiTokens from 'Pages/Server/pages/UserApiToken/UserApiTokens';
import UserSshKey from 'Pages/Server/pages/UserSshKey/UserSshKey';
import Users from 'Pages/Server/pages/Users/Users';
import cache from 'Graphql/client/cache';
import history from 'browserHistory';
import styles from './App.module.scss';

const routesWithTopBar = [
  ROUTE.USERS,
  ROUTE.HOME,
  ROUTE.PROJECT,
  ROUTE.USER_SSH_KEY,
  ROUTE.USER_API_TOKENS,
];

function Routes() {
  return (
    <Router history={history}>
      <Route path={routesWithTopBar} component={ServerBar} />
      <Switch>
        <Redirect exact from={ROUTE.HOME} to={ROUTE.PROJECTS} />

        <Route exact path={ROUTE.USERS} component={Users} />
        <Route exact path={ROUTE.NEW_USER} component={NewUser} />
        <Route exact path={ROUTE.USER_SSH_KEY} component={UserSshKey} />
        <Route exact path={ROUTE.USER_API_TOKENS} component={UserApiTokens} />
        <Route
          exact
          path={ROUTE.GENERATE_USER_API_TOKEN}
          component={GenerateApiToken}
        />

        <Route exact path={ROUTE.NEW_PROJECT} component={NewProject} />
        <Route
          exact
          path={ROUTE.PROJECT_CREATION}
          component={ProjectCreation}
        />
        
        <Route exact path={ROUTE.PROJECTS} component={Projects} />
        <Route path={ROUTE.PROJECT} component={Project} />
      </Switch>
    </Router>
  );
}

function App() {
  const client = new ApolloClient({
    uri: `${CONFIG.KDL_ADMIN_API_URL}/api/query`,
    credentials: 'include',
    cache,
  });

  return (
    <div className={styles.container}>
      <ApolloProvider client={client}>
        <Routes />
      </ApolloProvider>
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        transition={Slide}
        limit={1}
      />
    </div>
  );
}

export default App;
