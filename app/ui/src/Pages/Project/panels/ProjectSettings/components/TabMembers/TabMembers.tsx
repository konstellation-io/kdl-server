import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetProjectMembers,
  GetProjectMembers_project_members,
  GetProjectMembersVariables,
} from 'Graphql/queries/types/GetProjectMembers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';

import { GetUsers } from 'Graphql/queries/types/GetUsers';
import Member from './components/Member/Member';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { PANEL_THEME } from 'Components/Layout/Panel/Panel';
import styles from './TabMembers.module.scss';
import useMembers from 'Graphql/hooks/useMembers';
import useMemberDetails from 'Graphql/client/hooks/useMemberDetails';
import { useQuery, useReactiveVar } from '@apollo/client';
import { memberDetails } from 'Graphql/client/cache';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { AccessLevel } from 'Graphql/types/globalTypes';
import ManageMembers from './components/ManageMembers/ManageMembers';
import AddMembers from './components/AddMembers/AddMembers';

import GetMeQuery from 'Graphql/queries/getMe';
import GetUsersQuery from 'Graphql/queries/getUsers';
import GetMembersQuery from 'Graphql/queries/getProjectMembers';

type Props = {
  projectId: string;
  hasAccess: boolean;
};
function TabMembers({ projectId, hasAccess }: Props) {
  const { data: dataMe } = useQuery<GetMe>(GetMeQuery);

  const [selectedMembers, setSelectedMembers] = useState<GetProjectMembers_project_members[]>([]);
  const { updateMembersAccessLevel } = useMembers(projectId);

  const { updateMemberDetails } = useMemberDetails();
  const { openPanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.MEMBER_INFO,
    title: 'Member details',
    fixedWidth: true,
    theme: PANEL_THEME.DARK,
  });

  const { data: dataUsers, loading: loadingUsers, error: errorUsers } = useQuery<GetUsers>(GetUsersQuery);

  const {
    data: dataMembers,
    loading: loadingMembers,
    error: errorMembers,
  } = useQuery<GetProjectMembers, GetProjectMembersVariables>(GetMembersQuery, {
    variables: {
      id: projectId,
    },
  });

  const memberDetailsData = useReactiveVar(memberDetails);

  const openDetails = useCallback(
    (details: GetProjectMembers_project_members) => {
      updateMemberDetails(details);
      openPanel();
    },
    [updateMemberDetails, openPanel],
  );

  const canManageMembers = useMemo(() => {
    const meAsMember = dataMembers?.project.members.find(({ user }) => user.email === dataMe?.me.email);
    return meAsMember?.accessLevel === AccessLevel.ADMIN;
  }, [dataMe, dataMembers]);

  // Update opened member details as data is updated
  useEffect(() => {
    if (dataMembers && memberDetailsData) {
      const selectedMember = dataMembers.project.members.find((m) => m.user.id === memberDetailsData.user.id);

      if (selectedMember) updateMemberDetails(selectedMember);
    }
    // We want to execute this on when members get an update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMembers]);

  if (loadingMembers || loadingUsers) return <SpinnerCircular />;
  if (!dataMembers || !dataUsers || errorMembers || errorUsers) return <ErrorMessage />;

  function handleCheckClick(member: GetProjectMembers_project_members, selected: boolean) {
    if (selected) setSelectedMembers([...selectedMembers, member]);
    else setSelectedMembers(selectedMembers.filter(({ user }) => user.id !== member.user.id));
  }

  const isMemberSelected = (member: GetProjectMembers_project_members) =>
    !!selectedMembers.find(({ user }) => user.id === member.user.id);

  return (
    <div className={styles.container} data-testid="tabMembers">
      {canManageMembers && hasAccess && (
        <>
          <AddMembers projectId={projectId} users={dataUsers.users} members={dataMembers.project.members} />
          <ManageMembers
            projectId={projectId}
            selectedMembers={selectedMembers}
            onCompleteManage={() => setSelectedMembers([])}
          />
        </>
      )}
      <div className={styles.members}>
        {dataMembers.project.members.map((member) => (
          <Member
            key={member.user.id}
            member={member}
            selected={isMemberSelected(member)}
            canBeSelected={member.user.email !== dataMe?.me.email}
            canManageMembers={canManageMembers}
            onInfoClick={openDetails}
            onChangeMemberLevel={updateMembersAccessLevel}
            onCheckClick={handleCheckClick}
            hasAccess={hasAccess}
          />
        ))}
      </div>
    </div>
  );
}

export default TabMembers;
