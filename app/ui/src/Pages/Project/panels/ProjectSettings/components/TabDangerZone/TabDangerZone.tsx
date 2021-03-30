import MessageActionBox, {
  BOX_THEME,
} from 'Components/MessageActionBox/MessageActionBox';

import IconArchive from '@material-ui/icons/Archive';
import React from 'react';
import styles from './TabDangerZone.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { toast } from 'react-toastify';

type Props = {
  projectId: string;
  archived: boolean;
};

function TabDangerZone({ projectId, archived }: Props) {
  const {
    archiveProjectAction: { updateProjectArchived, loading },
  } = useProject({ onUpdateCompleted: handleUpdateCompleted });

  function handleUpdateCompleted() {
    toast.info('The project has been archived successfully!');
  }

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
          onClick: () => updateProjectArchived(projectId, !archived),
          Icon: IconArchive,
          disabled: loading,
          loading,
        }}
        theme={BOX_THEME.DEFAULT}
      />
    </div>
  );
}

export default TabDangerZone;
