import { ProjectState, RepositoryType } from 'Graphql/types/globalTypes';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { FC } from 'react';
import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from 'Pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './Project.module.scss';

type Props = {
  project: GetProjects_projects;
};

const Project: FC<Props> = ({ project }) => {
  const isProjectArchived = project.state === ProjectState.ARCHIVED;

  return (
    <Link to={buildRoute(ROUTE.PROJECT, project.id)}>
      <div
        className={cx(styles.container, {
          [styles.archived]: isProjectArchived,
        })}
      >
        <UpperBg project={project} />
        <LowerBg project={project} />
        <Band project={project} />
        <Square project={project} />
      </div>
    </Link>
  );
};

const UpperBg: FC<Props> = ({ project }) => (
  <div className={styles.sup}>
    <div className={styles.bg}>
      <div className={styles.bgBand} />
    </div>
    <div className={styles.content}>
      <p className={styles.name}>{project.name}</p>
    </div>
  </div>
);

const LowerBg: FC<Props> = ({ project }) => (
  <div className={styles.inf}>
    <div className={styles.bg}>
      <div className={styles.bgBand} />
    </div>
    <div className={styles.content}>
      <p className={styles.description} title={project.description}>
        {project.description}
      </p>
      <div className={styles.creationDate}>
        <p className={styles.creationDateLabel}>CREATED:</p>
        <p className={styles.date}>
          {formatDate(new Date(project.creationDate), true)}
        </p>
      </div>
    </div>
  </div>
);

const Band: FC<Props> = ({ project }) => (
  <div className={styles.band}>
    <div className={styles.label}>
      {`${project.repository?.type} REPOSITORY`}
    </div>
    {project.error && <div className={styles.warning}>WARNING</div>}
  </div>
);

const Square: FC<Props> = ({ project }) => (
  <div className={styles.square}>
    <div className={cx(styles.state, styles[project.state])} />
    <div className={styles.repoType}>
      <RepositoryTypeComponent
        squareLocation={
          project.repository?.type === RepositoryType.EXTERNAL
            ? LOCATION.OUT
            : LOCATION.IN
        }
        customSize={38}
        shouldAnimate={false}
      />
    </div>
  </div>
);

export default Project;
