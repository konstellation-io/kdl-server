import {
  Button,
  ErrorMessage,
  SearchSelect,
  SearchSelectTheme,
  SpinnerCircular,
} from 'kwc';
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
import { loader } from 'graphql.macro';
import styles from './TabMembers.module.scss';
import useMember from 'Graphql/hooks/useMember';
import useMemberDetails from 'Graphql/client/hooks/useMemberDetails';
import { useQuery, useReactiveVar } from '@apollo/client';
import { memberDetails } from 'Graphql/client/cache';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { AccessLevel } from 'Graphql/types/globalTypes';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');
const GetUsersQuery = loader('Graphql/queries/getUsers.graphql');
const GetMembersQuery = loader('Graphql/queries/getProjectMembers.graphql');

type Props = {
  projectId: string;
};
function TabMembers({ projectId }: Props) {
  const { data: dataMe } = useQuery<GetMe>(GetMeQuery);
  const [memberSelection, setMemberSelection] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const { addMembersById } = useMember(projectId, {
    onCompleteAdd: () => setMemberSelection([]),
  });

  const { updateMemberDetails } = useMemberDetails();
  const { openPanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.MEMBER_INFO,
    title: 'Member details',
    fixedWidth: true,
    theme: PANEL_THEME.DARK,
  });

  const {
    data: dataUsers,
    loading: loadingUsers,
    error: errorUsers,
  } = useQuery<GetUsers>(GetUsersQuery);
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
    [updateMemberDetails, openPanel]
  );

  const canAddMembers = useMemo(() => {
    if (dataMe?.me && dataMembers?.project) {
      const meAsMember = dataMembers.project.members.find(
        ({ user }) => user.email === dataMe.me.email
      );
      return meAsMember?.accessLevel === AccessLevel.ADMIN;
    }
  }, [dataMe, dataMembers]);

  // Update opened member details as data is updated
  useEffect(() => {
    if (dataMembers && memberDetailsData) {
      const selectedMember = dataMembers.project.members.find(
        (m) => m.user.id === memberDetailsData.user.id
      );

      if (selectedMember) updateMemberDetails(selectedMember);
    }
    // We want to execute this on when members get an update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMembers]);

  if (loadingMembers || loadingUsers) return <SpinnerCircular />;
  if (!dataMembers || !dataUsers || errorMembers || errorUsers)
    return <ErrorMessage />;

  const users = dataUsers.users.map((user) => user.email);
  const members = dataMembers.project.members.map(
    (member) => member.user.email
  );
  const allMembers = [...members, ...memberSelection];

  const options = users.filter((email) => !allMembers.includes(email));

  function performAddMembers() {
    if (dataUsers) {
      const emailToId = Object.fromEntries(
        dataUsers.users.map((user) => [user.email, user.id])
      );
      addMembersById(memberSelection.map((member) => emailToId[member]));
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formSearch}>
        {canAddMembers && (
          <>
            <SearchSelect
              options={options}
              theme={SearchSelectTheme.LIGHT}
              chipSelection={memberSelection}
              onRemoveChip={(email) =>
                setMemberSelection(memberSelection.filter((m) => m !== email))
              }
              onChange={(value: string) => {
                setError('');
                if (value) {
                  if (users.includes(value)) {
                    setMemberSelection([...memberSelection, value]);
                  } else {
                    setError('Add a user from the Server users');
                  }
                }
              }}
              className={styles.formInput}
              placeholder="Find a new member..."
              error={error}
              showSearchIcon
              hideLabel
              showClear
              hideError
            />
            <Button
              label="Add"
              height={44}
              onClick={performAddMembers}
              disabled={!memberSelection.length}
            />
          </>
        )}
      </div>
      <div className={styles.members}>
        {dataMembers.project.members.map((member) => (
          <Member key={member.user.id} member={member} onOpen={openDetails} />
        ))}
      </div>
    </div>
  );
}

export default TabMembers;
