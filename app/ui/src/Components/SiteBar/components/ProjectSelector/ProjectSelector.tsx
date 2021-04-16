import React, { FC } from 'react';
import styles from './ProjectSelector.module.scss';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { NavLink } from 'react-router-dom';
import ROUTE, { buildRoute } from 'Constants/routes';
import { Button } from 'kwc';
import IconAdd from '@material-ui/icons/Add';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';

type Props = {
  options: GetProjects_projects[];
};
const ProjectSelector: FC<Props & BottomComponentProps> = ({
  options,
  closeComponent = () => {},
}) => (
  <div className={styles.container}>
    <ul>
      {options.map(({ id, name }: GetProjects_projects) => (
        <NavLink
          to={buildRoute(ROUTE.PROJECT, id)}
          key={id}
          onClick={closeComponent}
          activeClassName={styles.selectedProject}
          className={styles.project}
        >
          <li className={styles.projectName}>{name}</li>
        </NavLink>
      ))}
    </ul>
    <Button
      Icon={IconAdd}
      label="New project"
      className={styles.addProjectButton}
      to={ROUTE.NEW_PROJECT}
    />
  </div>
);
export default ProjectSelector;
