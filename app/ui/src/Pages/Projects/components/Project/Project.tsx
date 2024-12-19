import { AccessLevel } from 'Graphql/types/globalTypes';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { FC } from 'react';
import { capitalize } from 'lodash';
import RepositoryTypeComponent, {
  LOCATION,
} from 'Pages/NewProject/pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './Project.module.scss';
import { ProjectAdmins } from '../../Projects';

type BaseProps = {
  project: GetProjects_projects;
};

type Props = {
  showAdmins: (projectAdmins: ProjectAdmins) => void;
  project: GetProjects_projects;
};

function Project({ project, showAdmins }: Props) {
  const disabled = project.needAccess || project.archived;
  const Component = (
    <div
      data-testid="project"
      className={cx(styles.container, {
        [styles.archived]: project.archived,
      })}
    >
      <UpperBg project={project} showAdmins={showAdmins} />
      <LowerBg project={project} />
      <Band project={project} />
      <Square project={project} />
    </div>
  );
  return disabled ? (
    <div className={styles.disabled}>{Component}</div>
  ) : (
    <Link to={buildRoute(ROUTE.PROJECT, project.id)}>{Component}</Link>
  );
}

function UpperBg({ project, showAdmins }: Props) {
  function onContactAdmins() {
    const projectAdmins = project.members.filter((u) => u.accessLevel === AccessLevel.ADMIN).map((u) => u.user.email);

    showAdmins({
      projectName: project.name,
      administrators: projectAdmins,
    });
  }

  return (
    <div className={styles.sup}>
      <div className={styles.bg}>
        <div className={styles.bgBand} />
      </div>
      <div className={styles.content}>
        <p className={styles.name} data-testid="projectName">
          {project.name}
        </p>
        {project.needAccess && (
          <div className={styles.contactInfo} onClick={onContactAdmins} data-testid="showAdminsButton">
            Need access?
          </div>
        )}
      </div>
    </div>
  );
}

const LowerBg: FC<BaseProps> = ({ project }) => (
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
        <p className={styles.date}>{formatDate(new Date(project.creationDate), true)}</p>
      </div>
    </div>
  </div>
);

const Band: FC<BaseProps> = ({ project }) => (
  <div className={styles.band}>
    <div className={styles.otherLabels}>
      {project.archived && (
        <div className={styles.labelArchived} data-testid="projectArchived">
          Archived
        </div>
      )}
      {project.needAccess && <div className={styles.labelNoAccess}>No Access</div>}
    </div>
    {project.error && <div className={styles.warning}>WARNING</div>}
  </div>
);

const Square: FC<BaseProps> = ({ project }) => (
  <div className={styles.square}>
    <div className={styles.repoType}>
      <RepositoryTypeComponent
        squareLocation={LOCATION.OUT}
        customSize={38}
        shouldAnimate={false}
      />
    </div>
  </div>
);

export default Project;
