import { GetProjectMembers_project_members } from 'Graphql/queries/types/GetProjectMembers';
import Gravatar from 'react-gravatar';
import IconOpen from '@material-ui/icons/ArrowForward';
import { Check, Select } from 'kwc';
import React from 'react';
import styles from './Member.module.scss';
import { AccessLevel } from 'Graphql/types/globalTypes';

const gravatarStyle = {
  borderRadius: '50%',
};

type Props = {
  member: GetProjectMembers_project_members;
  onInfoClick: (member: GetProjectMembers_project_members) => void;
  onChangeMemberLevel: (
    member: GetProjectMembers_project_members,
    newAccessLevel: AccessLevel
  ) => void;
  onCheckClick: (
    member: GetProjectMembers_project_members,
    selected: boolean
  ) => void;
  checked: boolean;
  canBeSelected?: boolean;
  canManageMembers?: boolean;
};
function Member({
  member,
  onInfoClick,
  onChangeMemberLevel,
  onCheckClick,
  checked,
  canBeSelected = false,
  canManageMembers = false,
}: Props) {
  const mapAccessLevel = {
    [AccessLevel.ADMIN]: 'Admin',
    [AccessLevel.MANAGER]: 'Manager',
    [AccessLevel.VIEWER]: 'Viewer',
  };

  return (
    <div className={styles.container}>
      {canManageMembers && (
        <Check
          className={styles.check}
          checked={checked}
          indeterminate={!canBeSelected}
          onChange={(selected) =>
            canBeSelected && onCheckClick(member, selected)
          }
        />
      )}
      <div className={styles.infoContainer}>
        <div className={styles.leftWrapper} onClick={() => onInfoClick(member)}>
          <Gravatar email={member.user.email} size={24} style={gravatarStyle} />
          <p className={styles.email}>{member.user.email}</p>
        </div>
        <div className={styles.rightWrapper}>
          {canManageMembers ? (
            <Select
              className={styles.accessLevelSelector}
              options={Object.keys(AccessLevel)}
              formSelectedOption={member.accessLevel}
              valuesMapper={mapAccessLevel}
              height={20}
              onChange={(newLevel: AccessLevel) =>
                onChangeMemberLevel(member, newLevel)
              }
              disabled={!canBeSelected}
              hideError
            />
          ) : (
            <span
              className={styles.accessLevel}
              onClick={() => onInfoClick(member)}
            >
              {mapAccessLevel[member.accessLevel]}
            </span>
          )}
          <div className={styles.button} onClick={() => onInfoClick(member)}>
            <IconOpen className="icon-small" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Member;
