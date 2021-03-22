import { Button } from 'kwc';
import { GetProjectMembers_project_members } from 'Graphql/queries/types/GetProjectMembers';
import Gravatar from 'react-gravatar';
import IconOpen from '@material-ui/icons/ArrowForward';
import React from 'react';
import cx from 'classnames';
import styles from './Member.module.scss';

const gravatarStyle = {
  borderRadius: '50%',
};

type Props = {
  member: GetProjectMembers_project_members;
  onOpen: Function;
  active?: boolean;
};
function Member({ member, onOpen, active = false }: Props) {
  return (
    <div
      className={cx(styles.container, { [styles.active]: active })}
      onClick={() => onOpen(member)}
    >
      <Gravatar email={member.user.email} size={24} style={gravatarStyle} />
      <p className={styles.email}>{member.user.email}</p>
      <p className={styles.level}>{member.accessLevel}</p>
      <div className={styles.button}>
        <IconOpen className="icon-small" />
      </div>
    </div>
  );
}

export default Member;
