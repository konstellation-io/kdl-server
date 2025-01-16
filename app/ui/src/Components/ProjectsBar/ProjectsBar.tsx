import { Button, Left, Right } from 'kwc';

import IconAdd from '@material-ui/icons/Add';
import ProjectsFilter from './components/ProjectsFilter/ProjectsFilter';
import ProjectsOrder from './components/ProjectsOrder/ProjectsOrder';
import * as React from 'react';
import styles from './ProjectsBar.module.scss';
import ROUTE from 'Constants/routes';

type Props = {
  canAccessUser: boolean;
};

const ProjectsBar = ({ canAccessUser }: Props) => (
  <div className={styles.container}>
    <Left className={styles.left}>
      <ProjectsFilter />
      <ProjectsOrder />
    </Left>
    {canAccessUser && (
      <Right>
        <Button label="Add project" Icon={IconAdd} className={styles.addProjectButton} to={ROUTE.NEW_PROJECT} />
      </Right>
    )}
  </div>
);

export default ProjectsBar;
