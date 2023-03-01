import MessageActionBox, { BOX_THEME } from 'Components/MessageActionBox/MessageActionBox';

import IconArchive from '@material-ui/icons/Archive';
import * as React from 'react';
import styles from './TabDangerZone.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { toast } from 'react-toastify';
import useBoolState from 'Hooks/useBoolState';
import { ModalContainer, ModalLayoutInfo } from 'kwc';

type Props = {
  projectId: string;
};

function TabDangerZone({ projectId }: Props) {
  const {
    archiveProjectAction: { updateProjectArchived, loading },
  } = useProject({ onUpdateCompleted: handleUpdateCompleted });

  const { activate: showModal, deactivate: closeModal, value: isModalVisible } = useBoolState();

  function handleUpdateCompleted() {
    toast.info('The project has been archived successfully!');
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>Everything you do in this area is dangerous, be careful.</p>
      <div className={styles.actionBox}>
        <MessageActionBox
          title="Archive project"
          description="This project will be accessible and you will be able to recover it, but while it is
          archived you will not be able to make changes or use any resources associated with this project. To
          access this project again after being archived, go to server projects and filter by ARCHIVED (by
          default, archived projects are hidden)."
          action={{
            label: 'Archive',
            onClick: showModal,
            Icon: IconArchive,
            loading,
          }}
          theme={BOX_THEME.DEFAULT}
        />
      </div>
      {isModalVisible && (
        <ModalContainer
          title="Archiving project"
          onAccept={() => updateProjectArchived(projectId, true)}
          onCancel={closeModal}
          actionButtonLabel="Archive"
          actionButtonCancel="Cancel"
          warning
          blocking
        >
          <ModalLayoutInfo>
            You are going to archive this project. When a project is archived you will not be able to make changes or
            use any resources associated with this project. Are you sure you want archive it?
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default TabDangerZone;
