import React, { FC } from 'react';
import styles from './MemberItem.module.scss';
import { GetProjectMembers_project_members } from 'Graphql/queries/types/GetProjectMembers';

type Props = {
  member: GetProjectMembers_project_members;
};
const MemberItem: FC<Props> = ({ member }) => (
  <div className={styles.container}>{member.user.email}</div>
);

export default MemberItem;
