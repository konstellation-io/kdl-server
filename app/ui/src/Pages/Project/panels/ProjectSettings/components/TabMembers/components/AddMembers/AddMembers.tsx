import { Button, SearchSelect, SearchSelectTheme } from 'kwc';
import React, { useState } from 'react';
import styles from './AddMembers.module.scss';
import useMembers from 'Graphql/hooks/useMembers';
import { GetUsers_users } from 'Graphql/queries/types/GetUsers';
import { GetProjectMembers_project_members } from 'Graphql/queries/types/GetProjectMembers';

type Props = {
  projectId: string;
  users: GetUsers_users[];
  members: GetProjectMembers_project_members[];
};
function AddMembers({ projectId, users, members }: Props) {
  const [memberSelection, setMemberSelection] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const { addMembersById } = useMembers(projectId, {
    onCompleteAdd: () => setMemberSelection([]),
  });

  const usersEmail = users.map((user) => user.email);
  const membersEmail = members.map((member) => member.user.email);
  const allMembersEmail = [...membersEmail, ...memberSelection];

  const options = usersEmail.filter((email) => !allMembersEmail.includes(email));

  function performAddMembers() {
    if (users) {
      const emailToId = Object.fromEntries(users.map((user) => [user.email, user.id]));
      addMembersById(memberSelection.map((member) => emailToId[member]));
    }
  }

  return (
    <div className={styles.container} data-testid="addMembers">
      <SearchSelect
        options={options}
        theme={SearchSelectTheme.LIGHT}
        chipSelection={memberSelection}
        onRemoveChip={(email) => setMemberSelection(memberSelection.filter((m) => m !== email))}
        onChange={(value: string) => {
          setError('');
          if (value) {
            if (usersEmail.includes(value)) {
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
      <Button label="Add" height={44} onClick={performAddMembers} disabled={!memberSelection.length} />
    </div>
  );
}

export default AddMembers;
