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
import { newProject } from '../../Graphql/client/cache';

function ProjectCreation() {
  const [animCanEnd, setAnimCanEnd] = useState(false);

  const {
    addNewProject,
    create: { data: dataCreateProject },
  } = useProject();

  const {
    repository,
    information,
    internalRepository,
    externalRepository,
  } = useReactiveVar(newProject);

  // Animation should last for at least 3 seconds
  useEffect(() => {
    let timeout = window.setTimeout(() => {
      setAnimCanEnd(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const type = repository.values.type || RepositoryType.EXTERNAL;

    const inputRepository: RepositoryInput = {
      type,
    };

    if (type === RepositoryType.INTERNAL) {
      inputRepository.internal = {
        name: internalRepository.values.slug,
      };
    } else {
      inputRepository.external = externalRepository.values;
    }

    addNewProject({
      ...information.values,
      repository: inputRepository,
    });
    // We want to execute this on on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projectReady = animCanEnd && dataCreateProject;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Your project is creating now</h1>
        <span className={styles.subtitle}>
          In order to receive a login link to access
        </span>
        <div className={styles.animation}>
          <StatusCircle
            label={projectReady ? 'CREATED' : 'CREATING...'}
            animation={projectReady ? States.SUCCESS : States.INITIALIZING}
          />
        </div>
        <p className={styles.infoMessage}>
          If you don't want to wait, you may go to the project detail while it
          is being created, or to the Server and see all the projects.
        </p>
        <div className={styles.buttonsContainer}>
          <Button
            label="Go to home"
            className={styles.button}
            to={ROUTE.HOME}
          />
          <Button
            label="Go to project"
            to={buildRoute(
              ROUTE.PROJECT,
              dataCreateProject?.createProject.id || ''
            )}
            disabled={!projectReady}
            className={styles.button}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectCreation;
