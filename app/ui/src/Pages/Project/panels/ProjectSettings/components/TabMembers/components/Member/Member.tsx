import { GetProjectMembers_project_members } from 'Graphql/queries/types/GetProjectMembers';
import Gravatar from 'react-gravatar';
import IconOpen from '@material-ui/icons/ArrowForward';
import { Check, Select } from 'kwc';
import styles from './Member.module.scss';
import { AccessLevel } from 'Graphql/types/globalTypes';
import cx from 'classnames';
import { mapProjectAccessLevel } from 'Utils/accessLevel';

const gravatarStyle = {
  borderRadius: '50%',
};

type Props = {
  member: GetProjectMembers_project_members;
  onInfoClick: (member: GetProjectMembers_project_members) => void;
  onChangeMemberLevel: (userIds: string[], accessLevel: AccessLevel) => void;
  onCheckClick: (member: GetProjectMembers_project_members, selected: boolean) => void;
  selected: boolean;
  canBeSelected?: boolean;
  canManageMembers?: boolean;
  hasAccess: boolean;
};
function Member({
  member,
  onInfoClick,
  onChangeMemberLevel,
  onCheckClick,
  selected,
  canBeSelected = false,
  canManageMembers = false,
  hasAccess,
}: Props) {
  return (
    <div
      data-testid="member"
      className={cx(styles.container, {
        [styles.saveCheckSpace]: canManageMembers && !canBeSelected,
      })}
    >
      {canBeSelected && canManageMembers && hasAccess && (
        <Check
          className={cx(styles.check, { [styles.unselected]: !selected })}
          checked={selected}
          onChange={(isSelected) => canBeSelected && onCheckClick(member, isSelected)}
        />
      )}
      <div className={styles.infoContainer} onClick={() => (hasAccess ? onInfoClick(member) : null)}>
        <div className={styles.leftWrapper}>
          <Gravatar email={member.user.email} size={24} style={gravatarStyle} />
          <p className={styles.email}>{member.user.email}</p>
        </div>
        {hasAccess && (
          <div className={styles.rightWrapper}>
            {canManageMembers ? (
              <div onClick={(e) => e.stopPropagation()} data-testid="roleSelector">
                <Select
                  className={styles.accessLevelSelector}
                  options={Object.keys(AccessLevel)}
                  formSelectedOption={member.accessLevel}
                  valuesMapper={mapProjectAccessLevel}
                  height={30}
                  onChange={(newLevel: AccessLevel) => onChangeMemberLevel([member.user.id], newLevel)}
                  disabled={!canBeSelected}
                  hideError
                />
              </div>
            ) : (
              <span className={styles.accessLevel} onClick={() => onInfoClick(member)}>
                {mapProjectAccessLevel[member.accessLevel]}
              </span>
            )}
            <div className={styles.button}>
              <IconOpen className="icon-small" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Member;
