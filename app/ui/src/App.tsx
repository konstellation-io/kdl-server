import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
} from '@apollo/client';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Slide, ToastContainer, toast } from 'react-toastify';

import { CONFIG } from 'index';
import GenerateApiToken from 'Pages/GenerateApiToken/GenerateApiToken';
import NewProject from 'Pages/NewProject/NewProject';
import NewUser from 'Pages/NewUser/NewUser';
import Project from 'Pages/Project/Project';
import ProjectCreation from 'Pages/ProjectCreation/ProjectCreation';
import Projects from 'Pages/Projects/Projects';
import ROUTE from 'Constants/routes';
import React from 'react';
import SiteBar from 'Components/SiteBar/SiteBar';
import UserApiTokens from 'Pages/UserApiToken/UserApiTokens';
import UserSshKey from 'Pages/UserSshKey/UserSshKey';
import Users from 'Pages/Users/Users';
import cache from 'Graphql/client/cache';
import history from 'browserHistory';
import { onError } from '@apollo/client/link/error';
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
      <Route path={routesWithTopBar} component={SiteBar} />
      <Switch>
        <Redirect exact from={ROUTE.HOME} to={ROUTE.PROJECTS} />

        <Route exact path={ROUTE.USERS} component={Users} />
        <Route exact path={ROUTE.NEW_USER} component={NewUser} />
        <Route exact path={ROUTE.USER_SSH_KEY} component={UserSshKey} />
        <Route exact path={ROUTE.USER_API_TOKENS} component={UserApiTokens} />

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

const errorLink = onError(
  ({ graphQLErrors, networkError, forward, operation }) => {
    let errorMsg = 'Unknown error';

    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
      errorMsg = 'There was an error requesting information from the server';
    } else if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      errorMsg = 'Could not connect to the Server';
    }

    toast.error(errorMsg, { autoClose: false });
    forward(operation);
  }
);

function App() {
  const httpLink = new HttpLink({
    uri: `${CONFIG.SERVER_URL}/api/query`,
  });

  const client = new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === 'development',
    credentials: 'include',
    cache,
    link: ApolloLink.from([errorLink, httpLink]),
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
