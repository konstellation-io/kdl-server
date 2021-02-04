import {
  Button,
  ErrorMessage,
  SearchSelect,
  SearchSelectTheme,
  SpinnerCircular,
} from 'kwc';
import {
  GET_MEMBER_DETAILS,
  GetMemberDetails,
} from 'Graphql/client/queries/getMemberDetails.graphql';
import {
  GetProjectMembers,
  GetProjectMembersVariables,
} from 'Graphql/queries/types/GetProjectMembers';
import React, { useCallback, useEffect, useState } from 'react';
import usePanel, { PanelType } from 'Pages/Home/apollo/hooks/usePanel';

import { GetUsers } from 'Graphql/queries/types/GetUsers';
import Member from './components/Member/Member';
import { MemberDetails } from 'Pages/Home/apollo/models/MemberDetails';
import { PANEL_ID } from 'Pages/Home/apollo/models/Panel';
import { loader } from 'graphql.macro';
import styles from './TabMembers.module.scss';
import useMember from 'Graphql/hooks/useMember';
import useMemberDetails from 'Pages/Home/apollo/hooks/useMemberDetails';
import { useQuery } from '@apollo/client';

const GetUsersQuery = loader('Graphql/queries/getUsers.graphql');
const GetMembersQuery = loader('Graphql/queries/getProjectMembers.graphql');

type Props = {
  projectId: string;
};
function TabMembers({ projectId }: Props) {
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
    isDark: true,
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
  const { data: memberDetailsData } = useQuery<GetMemberDetails>(
    GET_MEMBER_DETAILS
  );

  const openDetails = useCallback(
    (details: MemberDetails) => {
      updateMemberDetails(details);
      openPanel();
    },
    [updateMemberDetails, openPanel]
  );

  // Update opened member details as data is updated
  useEffect(() => {
    if (dataMembers && memberDetailsData) {
      const selectedMember = dataMembers.project.members.find(
        (m) => m.id === memberDetailsData.memberDetails?.id
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
  const members = dataMembers.project.members.map((member) => member.email);
  const allMembers = [...members, ...memberSelection];

  const options = users.filter((email) => !allMembers.includes(email));

  function performAddmembers() {
    if (dataUsers) {
      const emailToId = Object.fromEntries(
        dataUsers.users.map((user) => [user.email, user.id])
      );
      addMembersById(memberSelection.map((member) => emailToId[member]));
    }
  }

  return (
    <div>
      <div className={styles.formSearch}>
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
        />
        <Button
          label="ADD"
          height={44}
          onClick={performAddmembers}
          disabled={!memberSelection.length}
        />
      </div>
      <div className={styles.members}>
        {dataMembers.project.members.map((member) => (
          <Member key={member.id} member={member} onOpen={openDetails} />
        ))}
      </div>
    </div>
  );
}

export default TabMembers;
