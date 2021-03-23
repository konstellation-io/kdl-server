import { Link } from 'react-router-dom';
import ROUTE from 'Constants/routes';

import IconAdd from '@material-ui/icons/Add';
import React from 'react';
import styles from './Project.module.scss';

const AddProject = () => (
  <div className={styles.addProjectContainer}>
    <Link to={ROUTE.NEW_PROJECT} data-test-id="addProject">
      <div className={styles.addProjectBg}>
        <div className={styles.addProjectBgUpper} />
        <div className={styles.addProjectBgLower} />
      </div>
    </Link>
    <div className={styles.addProjectLabel}>
      <IconAdd className="icon-regular" />
      <p>ADD PROJECT</p>
    </div>
  </div>
);

export default AddProject;
