import MessageActionBox, {
  BOX_THEME,
} from 'Components/MessageActionBox/MessageActionBox';

import IconArchive from '@material-ui/icons/Archive';
import IconDelete from '@material-ui/icons/Delete';
import React from 'react';
import styles from './TabDangerZone.module.scss';

function TabDangerZone() {
  return (
    <div className={styles.container}>
      <p className={styles.title}>
        Everything you do in this area is dangerous, be careful.
      </p>
      <MessageActionBox
        title="Archive project"
        desciption="This project will be accessible and you will be able to recover it, but while it is 
          archived you will not be able to make changes or use any resources associated with this project. To 
          access this project again after being archived, go to server projects and filter by ARCHIVED (by 
          default, archived projects are hidden)."
        action={{
          label: 'ARCHIVE',
          onClick: () => {},
          Icon: IconArchive,
        }}
        theme={BOX_THEME.DEFAULT}
      />
      <MessageActionBox
        title="¿Do you want to delete this project? Be carefull"
        desciption="Deleted projects cannot be recovered, doing this action will delete permanently the actual 
          project, consider archiving it instead."
        action={{
          label: 'DELETE',
          onClick: () => {},
          Icon: IconDelete,
        }}
        theme={BOX_THEME.ERROR}
      />
    </div>
  );
}

export default TabDangerZone;
