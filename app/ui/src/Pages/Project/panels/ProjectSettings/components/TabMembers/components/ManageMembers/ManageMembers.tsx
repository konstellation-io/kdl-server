import {
  Button,
  BUTTON_ALIGN,
  ModalContainer,
  ModalLayoutConfirmList,
  Select,
} from 'kwc';
import React, { useRef } from 'react';
import styles from './ManageMembers.module.scss';
import useMembers from 'Graphql/hooks/useMembers';
import { AccessLevel } from 'Graphql/types/globalTypes';
import {
  defaultModalInfo,
  getModalInfo,
  ModalInfo,
} from '../../confirmationModals';
import { GetProjectMembers_project_members } from 'Graphql/queries/types/GetProjectMembers';
import MemberItem from './components/MemberItem/MemberItem';
import DeleteIcon from '@material-ui/icons/Delete';
import useBoolState from 'Hooks/useBoolState';

const accessLevelSeparator = () => (
  <Button
    key="separator"
    label="CHANGE MEMBERS LEVEL TO"
    className={styles.separator}
    align={BUTTON_ALIGN.LEFT}
    disabled
  />
);

type Props = {
  projectId: string;
  checkedMembers: GetProjectMembers_project_members[];
  onCompleteRemove: () => void;
};
function ManageMembers({ projectId, checkedMembers, onCompleteRemove }: Props) {
  const { toggle: toggleModal, value: isModalVisible } = useBoolState();
  const modalInfo = useRef<ModalInfo>(defaultModalInfo);

  const { updateMembersAccessLevel, removeMembersById } = useMembers(
    projectId,
    {
      onCompleteUpdate: toggleModal,
      onCompleteRemove: () => {
        onCompleteRemove();
        toggleModal();
      },
    }
  );

  const hasNotMembersSelected = checkedMembers.length === 0;
  const membersIds = () => checkedMembers.map(({ user }) => user.id);

  function showAccessLevelModal(accessLevel: AccessLevel) {
    modalInfo.current = getModalInfo({
      nMembers: checkedMembers.length,
      type: 'update',
      action: () => updateMembersAccessLevel(membersIds(), accessLevel),
      accessLevel: accessLevel,
    });
    toggleModal();
  }

  function showRemoveModal() {
    modalInfo.current = getModalInfo({
      nMembers: checkedMembers.length,
      type: 'remove',
      action: () => removeMembersById(membersIds()),
    });
    toggleModal();
  }

  const removeMembersButton = () => (
    <Button
      key="remove"
      label="REMOVE MEMBERS"
      onClick={showRemoveModal}
      className={styles.manageMemberButton}
      Icon={DeleteIcon}
      align={BUTTON_ALIGN.LEFT}
    />
  );

  const AccessLevelButton = (accessLevel: AccessLevel) => (
    <Button
      key={accessLevel}
      label={accessLevel.toUpperCase()}
      onClick={() => showAccessLevelModal(accessLevel)}
      className={styles.manageMemberButton}
      align={BUTTON_ALIGN.LEFT}
    />
  );

  const optionToButton = {
    'remove members': removeMembersButton,
    'access levels': accessLevelSeparator,
    admin: () => AccessLevelButton(AccessLevel.ADMIN),
    manager: () => AccessLevelButton(AccessLevel.MANAGER),
    viewer: () => AccessLevelButton(AccessLevel.VIEWER),
  };

  return (
    <div className={styles.container}>
      <span className={styles.checkedMembers}>
        {checkedMembers.length === 1
          ? `${checkedMembers.length} User selected`
          : `${checkedMembers.length} Users selected`}
      </span>
      <Select
        placeholder="Select one"
        className={styles.accessLevelSelector}
        options={Object.keys(optionToButton)}
        CustomOptions={optionToButton}
        disabledOptions={[Object.keys(optionToButton)[1]]}
        showSelectAllOption={false}
        shouldSort={false}
        height={30}
        disabled={hasNotMembersSelected}
        hideError
      />
      {isModalVisible && (
        <ModalContainer
          title={modalInfo.current.title}
          onAccept={modalInfo.current.action}
          onCancel={toggleModal}
          actionButtonLabel={modalInfo.current.acceptLabel}
          warning={modalInfo.current.warning}
          error={modalInfo.current.error}
          blocking
        >
          <ModalLayoutConfirmList message={modalInfo.current.message}>
            {checkedMembers.map((m) => (
              <MemberItem key={m.user.id} member={m} />
            ))}
          </ModalLayoutConfirmList>
        </ModalContainer>
      )}
    </div>
  );
}

export default ManageMembers;
