import React from 'react';
import { CONFIG } from 'index';
import IconLink from '@material-ui/icons/Link';
import styles from './InternalRepository.module.scss';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';
import MessageActionBox, {
  BOX_THEME,
} from 'Components/MessageActionBox/MessageActionBox';

function InternalRepository() {
  const {
    information: {
      values: { id },
    },
  } = useReactiveVar(newProject);

  const warningMessage = `The id you have picked is: ${id}. Be careful, once the project has been created you cannot change the project id. We use this id to create all the pieces Konstellation needs in order to offer a better AI dev experience. Also take into account that we are using the project id to create the url, so if you don't like it you are in time to change, you can modify the project id going back to the first step. The url we are generating is unique and will be immutable, you can copy it now or you'll be able to copy it in other sections of the application.`;

  return (
    <div className={styles.repositoryInternal}>
      <div className={styles.url}>
        <p className={styles.urlTitle}>repository url</p>
        <div className={styles.serverUrlContainer}>
          <IconLink className="icon-regular" />
          <span
            className={styles.urlContent}
          >{`${CONFIG.GITEA_URL}/kdl/${id}`}</span>
        </div>
      </div>
      <div className={styles.warningBox}>
        <MessageActionBox
          title="WARNING"
          description={warningMessage}
          theme={BOX_THEME.WARN}
        />
      </div>
    </div>
  );
}

export default InternalRepository;
