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
    <div className={cx(styles.container, { [styles.active]: active })}>
      <Gravatar email={member.email} size={24} style={gravatarStyle} />
      <p className={styles.email}>{member.email}</p>
      <p className={styles.level}>{member.accessLevel}</p>
      <div className={styles.button}>
        <Button Icon={IconOpen} label="" onClick={() => onOpen(member)} />
      </div>
    </div>
  );
}

export default Member;
