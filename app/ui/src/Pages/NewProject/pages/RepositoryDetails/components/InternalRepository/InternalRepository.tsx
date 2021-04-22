import React from 'react';

import { CONFIG } from 'index';
import IconLink from '@material-ui/icons/Link';
import styles from './InternalRepository.module.scss';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';

function InternalRepository() {
  const {
    information: { values },
  } = useReactiveVar(newProject);

  return (
    <div className={styles.repositoryInternal}>
      <div className={styles.url}>
        <p className={styles.urlTitle}>repository url</p>
        <div className={styles.serverUrlContainer}>
          <IconLink className="icon-regular" />
          <span
            className={styles.urlContent}
          >{`${CONFIG.GITEA_URL}/kdl/${values.id}`}</span>
        </div>
      </div>
    </div>
  );
}

export default InternalRepository;
