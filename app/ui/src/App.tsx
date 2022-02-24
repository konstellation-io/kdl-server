import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, useQuery } from '@apollo/client';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Slide, toast, ToastContainer } from 'react-toastify';

import { CONFIG } from 'index';
import NewProject from 'Pages/NewProject/NewProject';
import Project from 'Pages/Project/Project';
import ProjectCreation from 'Pages/ProjectCreation/ProjectCreation';
import Projects from 'Pages/Projects/Projects';
import ROUTE from 'Constants/routes';
import * as React from 'react';
import SiteBar from 'Components/SiteBar/SiteBar';
import UserSshKey from 'Pages/UserSshKey/UserSshKey';
import Users from 'Pages/Users/Users';
import cache from 'Graphql/client/cache';
import history from 'browserHistory';
import { onError } from '@apollo/client/link/error';
import styles from './App.module.scss';
import { GetMe } from './Graphql/queries/types/GetMe';
import GetMeQuery from './Graphql/queries/getMe';
import { ErrorMessage, SpinnerCircular } from 'kwc';
import { AccessLevel } from './Graphql/types/globalTypes';
import UserKubeconfig from './Pages/UserKubeconfig/UserKubeconfig';

const routesWithTopBar = [ROUTE.USERS, ROUTE.HOME, ROUTE.PROJECT, ROUTE.USER_SSH_KEY];

function Routes() {
  const { data, loading, error } = useQuery<GetMe>(GetMeQuery);

  if (loading || !data) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const canAccessUsers = data.me.accessLevel === AccessLevel.ADMIN;

  return (
    <Router history={history}>
      <Route path={routesWithTopBar} component={SiteBar} />
      <Switch>
        <Redirect exact from={ROUTE.HOME} to={ROUTE.PROJECTS} />

        {canAccessUsers && <Route exact path={ROUTE.USERS} component={Users} />}
        {data.me.isKubeconfigEnabled ? (
          <Route exact path={ROUTE.USER_KUBECONFIG} component={UserKubeconfig} />
        ) : (
          <Redirect exact from={ROUTE.USER_KUBECONFIG} to={ROUTE.PROJECTS} />
        )}

        <Route exact path={ROUTE.USER_SSH_KEY} component={UserSshKey} />

        <Route exact path={ROUTE.NEW_PROJECT} component={NewProject} />
        <Route exact path={ROUTE.PROJECT_CREATION} component={ProjectCreation} />

        <Route exact path={ROUTE.PROJECTS} component={Projects} />
        <Route path={ROUTE.PROJECT} component={Project} />
      </Switch>
    </Router>
  );
}

const errorLink = onError(({ graphQLErrors, networkError, forward, operation }) => {
  let errorMsg = 'Unknown error';

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    );
    errorMsg = 'There was an error requesting information from the server';
  } else if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    errorMsg = 'Could not connect to the Server';
  }

  toast.error(errorMsg, { autoClose: false });
  forward(operation);
});

function App() {
  const httpLink = new HttpLink({
    uri: `${CONFIG.SERVER_URL}/api/query`,
  });

  const kgHttpLink = new HttpLink({
    uri: `${CONFIG.KG_SERVER_URL}/api/query`,
  });

  const client = new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === 'development',
    credentials: 'include',
    cache,
    link: ApolloLink.split(
      (operation) => operation.getContext().clientName === 'kg',
      ApolloLink.from([errorLink, kgHttpLink]),
      ApolloLink.from([errorLink, httpLink]),
    ),
  });

  return (
    <div className={styles.container}>
      <ApolloProvider client={client}>
        <Routes />
      </ApolloProvider>
      <ToastContainer
        role="toastMessage"
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
