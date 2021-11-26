import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import IconCloud from '@material-ui/icons/Cloud';
import IconTime from '@material-ui/icons/AccessTime';
import * as React from 'react';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './ProjectInfo.module.scss';

type Props = {
  project: GetProjects_projects;
};
function ProjectInfo({ project }: Props) {
  const repoError = project.repository?.error;

  return (
    <div className={cx(styles.container, { [styles.connected]: !repoError })}>
      <div className={styles.icon}>
        <IconCloud className="icon-big" />
      </div>
      <div>
        {project.lastActivationDate && (
          <div className={styles.time}>
            <IconTime className="icon-small" />
            <p>{`ACTIVE FROM: ${formatDate(new Date(project.lastActivationDate), true)}`}</p>
          </div>
        )}
        <div
          className={cx(styles.connection, {
            [styles.connected]: !repoError,
          })}
        >
          <p>{!repoError ? 'Connection established' : 'You are not connected to the repository'}</p>
        </div>
      </div>
    </div>
  );
}

export default ProjectInfo;
