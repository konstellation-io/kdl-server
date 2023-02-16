import MessageActionBox, { BOX_THEME } from 'Components/MessageActionBox/MessageActionBox';

import IconArchive from '@material-ui/icons/Archive';
import * as React from 'react';
import styles from './TabDangerZone.module.scss';
import useProject from 'Graphql/hooks/useProject';
import { toast } from 'react-toastify';
import useBoolState from 'Hooks/useBoolState';
import { ModalContainer, ModalLayoutInfo, TextInput } from 'kwc';
import IconRemove from '@material-ui/icons/Delete';
import { useState } from 'react';

type Props = {
  projectId: string;
  projectName: string;
};

function TabDangerZone({ projectId, projectName }: Props) {
  const {
    archiveProjectAction: { updateProjectArchived, loading },
    deleteProjectAction: { deleteProject, loading: loadingDelete },
  } = useProject({ onUpdateCompleted: handleUpdateCompleted, onDeleteCompleted: handleDeleteCompleted });

  const { activate: showArchiveModal, deactivate: closeArchiveModal, value: isArchiveModalVisible } = useBoolState();
  const { activate: showDeleteModal, deactivate: closeDeleteModal, value: isDeleteModalVisible } = useBoolState(true);
  const [inputProjectName, setInputProjectName] = useState<string>('');

  function handleUpdateCompleted() {
    toast.info('The project has been archived successfully!');
  }

  function handleDeleteCompleted() {
    toast.info('The project has been deleted successfully!');
  }

  function onDeleteProject() {
    if (inputProjectName !== projectName) return;

    deleteProject(projectId);
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
            onClick: showArchiveModal,
            Icon: IconArchive,
            loading,
          }}
          theme={BOX_THEME.WARN}
        />
      </div>
      <div className={styles.actionBox}>
        <MessageActionBox
          title="Delete project"
          description="This project will be accessible and you will be able to recover it, but while it is
          archived you will not be able to make changes or use any resources associated with this project. To
          access this project again after being archived, go to server projects and filter by ARCHIVED (by
          default, archived projects are hidden)."
          action={{
            label: 'Delete',
            onClick: showDeleteModal,
            Icon: IconRemove,
            loading,
          }}
          theme={BOX_THEME.ERROR}
        />
      </div>
      {isArchiveModalVisible && (
        <ModalContainer
          title="Archiving project"
          onAccept={() => updateProjectArchived(projectId, true)}
          onCancel={closeArchiveModal}
          actionButtonLabel="Archive"
          actionButtonCancel="Cancel"
          warning
          blocking
          // disabled={inputProjectName === projectName}
        >
          <ModalLayoutInfo>
            You are going to archive this project. When a project is archived you will not be able to make changes or
            use any resources associated with this project. Are you sure you want to archive it?
          </ModalLayoutInfo>
        </ModalContainer>
      )}
      {isDeleteModalVisible && (
        <ModalContainer
          title="Deleting project"
          onAccept={onDeleteProject}
          onCancel={closeDeleteModal}
          actionButtonLabel="Delete"
          actionButtonCancel="Cancel"
          error
          warning
          blocking
        >
          <ModalLayoutInfo>
            You are going to delete this project. When a project is deleted all resources associated with this project
            (gitea, drone, mlflow, filebrowser,...) are removed. This is a non reversible action. Are you sure you want
            to delete it?
          </ModalLayoutInfo>
          <div>
            Please type &quot;<span className={styles.projectName}>{projectName}</span>&quot; to confirm.
          </div>
          <TextInput placeholder="Project name" onChange={setInputProjectName} />
        </ModalContainer>
      )}
    </div>
  );
}

export default TabDangerZone;
