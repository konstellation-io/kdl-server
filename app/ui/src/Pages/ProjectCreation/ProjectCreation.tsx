import { Button } from 'kwc';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { useEffect, useState } from 'react';
import { RepositoryInput, RepositoryType } from 'Graphql/types/globalTypes';
import StatusCircle, {
  States,
} from 'Components/LottieShapes/StatusCircle/StatusCircle';

import styles from './ProjectCreation.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';
import useNewProject from 'Graphql/client/hooks/useNewProject';

function ProjectCreation() {
  const [resultReady, setResultReady] = useState(false);
  const { clearAll } = useNewProject('information');

  const {
    addNewProject,
    create: { data: createData, error: createError },
  } = useProject();

  const { repository, information, externalRepository } = useReactiveVar(
    newProject
  );

  const error = resultReady && !!createError;
  const success = resultReady && !!createData;

  // Animation should last for at least 3 seconds
  useEffect(() => {
    let timeout = window.setTimeout(() => {
      setResultReady(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const type = repository.values.type || RepositoryType.EXTERNAL;

    const inputRepository: RepositoryInput = {
      type,
    };

    if (type === RepositoryType.EXTERNAL) {
      inputRepository.external = externalRepository.values;
    }

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
    [success, error]
  );

  function getCircleProps() {
    console.log(success, error);
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
      <>
        <Button
          label="Go to projects list"
          className={styles.button}
          to={ROUTE.HOME}
        />
        <Button label="Go to project" to={project} className={styles.button} />
      </>
    );
  }
  function renderErrorButtons() {
    return (
      <>
        <Button
          label="Cancel"
          className={styles.button}
          to={ROUTE.HOME}
          onClick={clearAll}
        />
        <Button
          label="Try again"
          to={ROUTE.NEW_PROJECT}
          className={styles.button}
        />
      </>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Your project is creating now</h1>
        <div className={styles.animation}>
          <StatusCircle {...getCircleProps()} />
        </div>
        <p className={styles.infoMessage}>
          {success &&
            'Your project has been created successfully, you can go to the project list or open the project page directly.'}
          {error && createError?.message}
        </p>
        <div className={styles.buttonsContainer}>
          {success && renderSuccessButtons()}
          {error && renderErrorButtons()}
        </div>
      </div>
    </div>
  );
}

export default ProjectCreation;
