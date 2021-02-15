import { Button, SpinnerCircular } from 'kwc';
import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { useEffect } from 'react';

import { RepositoryInput, RepositoryType } from 'Graphql/types/globalTypes';
import StatusCircle from 'Components/LottieShapes/StatusCircle/StatusCircle';
import styles from './ProjectCreation.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { useQuery } from '@apollo/client';

function ProjectCreation() {
  const {
    addNewProject,
    create: { data: dataCreateProject },
  } = useProject();

  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);

  useEffect(() => {
    if (data) {
      const { repository, information } = data.newProject;
      const type = repository.values.type || RepositoryType.EXTERNAL;

      const inputRepository: RepositoryInput = {
        type,
      };

      if (type === RepositoryType.INTERNAL) {
        const { internalRepository } = data.newProject;
        inputRepository.internalRepoName = internalRepository.values.slug;
      } else {
        const { externalRepository } = data.newProject;
        inputRepository.externalRepoUrl = externalRepository.values.url;
      }

      addNewProject({
        ...information.values,
        repository: inputRepository,
      });
    }
    // We want to execute this on on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <SpinnerCircular />;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Your project is creating now</h1>
        <span className={styles.subtitle}>
          In order to receive a login link to access
        </span>
        <div className={styles.animation}>
          <StatusCircle label="CREATING..." key="ok" size={280} />
        </div>
        <p className={styles.infoMessage}>
          If you don't want to wait, you may go to the project detail while it
          is being created, or to the Server and see all the projects.
        </p>
        <div className={styles.buttonsContainer}>
          <Button
            label="GO TO HOME"
            className={styles.button}
            to={ROUTE.HOME}
          />
          <Button
            label="GO TO PROJECT"
            to={buildRoute(
              ROUTE.PROJECT,
              dataCreateProject?.createProject.id || ''
            )}
            disabled={!dataCreateProject}
            className={styles.button}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectCreation;
