import { Button, Left, Right } from 'kwc';

import IconAdd from '@material-ui/icons/Add';
import ProjectsFilter from './components/ProjectsFilter/ProjectsFilter';
import ProjectsOrder from './components/ProjectsOrder/ProjectsOrder';
import React from 'react';
import styles from './ProjectsBar.module.scss';
import ROUTE from 'Constants/routes';

const ProjectsBar = () => (
  <div className={styles.container}>
    <Left className={styles.left}>
      <ProjectsFilter />
      <ProjectsOrder />
    </Left>
    <Right>
      <Button
        label="ADD PROJECT"
        Icon={IconAdd}
        className={styles.addProjectButton}
        to={ROUTE.NEW_PROJECT}
      />
    </Right>
  </div>
);

export default ProjectsBar;
