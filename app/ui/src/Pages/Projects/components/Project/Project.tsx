import { AccessLevel } from 'Graphql/types/globalTypes';
import ROUTE, { buildRoute } from 'Constants/routes';
import React, { FC } from 'react';
import { capitalize } from 'lodash';
import RepositoryIcon, { LOCATION } from 'Pages/NewProject/pages/RepositoryIcon/RepositoryIcon';

import { useQuery, useReactiveVar } from '@apollo/client';
import { GetMe } from 'Graphql/queries/types/GetMe';
import GetMeQuery from 'Graphql/queries/getMe';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './Project.module.scss';
import { ProjectAdmins } from '../../Projects';

import { Button } from 'kwc';
import useProject from 'Graphql/hooks/useProject';
import { toast } from 'react-toastify';

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

function Band({ project }: BaseProps) {
  const { data: dataMe, error: errorMe, loading: loadingMe } = useQuery<GetMe>(GetMeQuery);
  const hasAccess = dataMe?.me?.accessLevel != AccessLevel.VIEWER;

  const {
    archiveProjectAction: { updateProjectArchived, loading },
  } = useProject({ onUpdateCompleted: handleUpdateCompleted });

  function unarchivePrj() {
    updateProjectArchived(project.id, false);
  }

  function handleUpdateCompleted() {
    toast.info('The project has been unarchived successfully!');
  }

  return (
    <div className={styles.band}>
      <div className={styles.otherLabels}>
        {project.archived && (
          <div className={styles.labelArchived} data-testid="projectArchived">
            Archived
          </div>
        )}
        {project.archived && hasAccess && (
          <Button label="Unarchive" className={styles.labelUnarchive} primary onClick={unarchivePrj} />
        )}
        {project.needAccess && <div className={styles.labelNoAccess}>No Access</div>}
      </div>
      {project.error && <div className={styles.warning}>WARNING</div>}
    </div>
  );
}

const Square: FC<BaseProps> = ({ project }) => (
  <div className={styles.square}>
    <div className={styles.repoType}>
      <RepositoryIcon squareLocation={LOCATION.OUT} customSize={38} shouldAnimate={false} />
    </div>
  </div>
);

export default Project;
