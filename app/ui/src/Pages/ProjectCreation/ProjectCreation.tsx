import { Button } from 'kwc';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { useEffect, useState } from 'react';
import { RepositoryInput } from 'Graphql/types/globalTypes';
import StatusCircle, { States } from 'Components/LottieShapes/StatusCircle/StatusCircle';

import styles from './ProjectCreation.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import cx from 'classnames';
import { useHistory } from 'react-router-dom';

function ProjectCreation() {
  const history = useHistory();
  const [animationFinished, setAnimationFinished] = useState(false);
  const { clearAll } = useNewProject('information');

  const {
    addNewProject,
    create: { data: createData, error: createError },
  } = useProject();

  const { repository, information } = useReactiveVar(newProject);

  const error = animationFinished && !!createError;
  const success = animationFinished && !!createData;

  // Animation should last for at least 3 seconds
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAnimationFinished(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // If the user reload the page he/she will be redirected to the home
    if (!information.values.id) {
      history.push(ROUTE.HOME);
      return;
    }
    // const type = RepositoryType.EXTERNAL;

    const inputRepository: RepositoryInput = {
      url: repository.values.url,
      username: repository.values.username,
      credential: repository.values.credential,
      authMethod: repository.values.authMethod,
    };

    // if (type === RepositoryType.EXTERNAL) {
    //   inputRepository.external = externalRepository.values;
    // }

    addNewProject({
      ...information.values,
      repository: inputRepository,
    });
    // We want to execute this on on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (success) clearAll();
    },
    [success, error, clearAll],
  );

  function getCircleProps() {
    switch (true) {
      case success:
        return { label: 'CREATED', animation: States.SUCCESS };
      case error:
        return { label: 'ERROR', animation: States.ERROR };
      default:
        return { label: 'CREATING...', animation: States.INITIALIZING };
    }
  }

  function renderSuccessButtons() {
    const project = buildRoute(ROUTE.PROJECT, information.values.id);
    return (
      <div className={styles.actionButtons}>
        <div className={styles.actionButton} data-testid="goToProjectsListButton">
          <Button label="Go to projects list" className={styles.button} to={ROUTE.HOME} />
        </div>
        <div className={styles.actionButton} data-testid="goToProjectButton">
          <Button label="Go to project" to={project} className={styles.button} />
        </div>
      </div>
    );
  }
  function renderErrorButtons() {
    return (
      <div className={styles.actionButtons}>
        <div className={styles.actionButton}>
          <Button label="Cancel" className={styles.button} to={ROUTE.HOME} onClick={clearAll} />
        </div>
        <div className={styles.actionButton} data-testid="tryAgainButton">
          <Button label="Try again" to={ROUTE.NEW_PROJECT} className={styles.button} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Your project is being created now</h1>
        <div className={styles.animation}>
          <StatusCircle {...getCircleProps()} />
        </div>
        {error && (
          <p className={styles.errorTitle} data-testid="errorMessage">
            There was an error creating your project
          </p>
        )}
        <div className={cx(styles.infoMessageWrapper, { [styles.error]: error })}>
          <div className={styles.infoMessage}>
            {success &&
              'Your project has been created successfully, you can go to the project list or open the project page directly.'}
            {error && createError?.message}
          </div>
        </div>
        <div className={styles.buttonsContainer}>
          {success && renderSuccessButtons()}
          {error && renderErrorButtons()}
        </div>
      </div>
    </div>
  );
}

export default ProjectCreation;
