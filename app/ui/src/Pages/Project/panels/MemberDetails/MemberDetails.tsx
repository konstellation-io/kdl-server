import { Button, Select } from 'kwc';
import {
  GetProjectMembers,
  GetProjectMembers_project_members,
  GetProjectMembersVariables,
} from 'Graphql/queries/types/GetProjectMembers';
import React, { useEffect, useMemo, useState } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import ActionsBar from 'Components/Layout/ActionsBar/ActionsBar';
import ConfirmAction from 'Components/Layout/ConfirmAction/ConfirmAction';
import { GetMe } from 'Graphql/queries/types/GetMe';
import Gravatar from 'react-gravatar';
import IconDate from '@material-ui/icons/Today';
import IconRemove from '@material-ui/icons/Delete';
import IconTime from '@material-ui/icons/Schedule';
import { formatDate } from 'Utils/format';
import styles from './MemberDetails.module.scss';
import { useForm } from 'react-hook-form';
import useMembers from 'Graphql/hooks/useMembers';
import { useQuery } from '@apollo/client';
import { mapProjectAccessLevel } from 'Utils/accessLevel';
import GetMeQuery from 'Graphql/queries/getMe';
import GetMembersQuery from 'Graphql/queries/getProjectMembers';

const gravatarStyle = {
  borderRadius: '50%',
};

type FormData = {
  accessLevel: AccessLevel;
};

type Props = {
  member: GetProjectMembers_project_members;
  projectId: string;
  close: () => void;
};

function MemberDetails({ member, projectId, close }: Props) {
  const { data: dataMe } = useQuery<GetMe>(GetMeQuery);
  const { data: dataMembers } = useQuery<GetProjectMembers, GetProjectMembersVariables>(GetMembersQuery, {
    variables: {
      id: projectId,
    },
  });

  const [done, setDone] = useState(false);
  const { removeMembersById, updateMembersAccessLevel } = useMembers(projectId, {
    onCompleteUpdate: () => setDone(true),
  });

  const { handleSubmit, setValue, unregister, register, watch } = useForm<FormData>({
    defaultValues: { accessLevel: member.accessLevel },
  });

  useEffect(() => {
    register('accessLevel');

    return () => unregister('accessLevel');
  }, [register, unregister]);

  useEffect(() => {
    setValue('accessLevel', member.accessLevel);
  }, [member, setValue]);

  const canManageMember = useMemo(() => {
    if (dataMe && dataMembers) {
      const meAsMember = dataMembers.project.members.find(({ user }) => user.email === dataMe.me.email);
      const isNotMe = dataMe.me.email !== member.user.email;
      const isAdmin = meAsMember?.accessLevel === AccessLevel.ADMIN;

      return isNotMe && isAdmin;
    }
    return false;
  }, [dataMe, dataMembers, member]);

  const accessLevelChanged = member.accessLevel !== watch('accessLevel');

  function handleUpdateMember({ accessLevel }: FormData) {
    if (accessLevelChanged) {
      updateMembersAccessLevel([member.user.id], accessLevel);
    }
  }
  function handleRemoveMember() {
    removeMembersById([member.user.id]);
    close();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.info}>
          <Gravatar email={member.user.email} size={160} style={gravatarStyle} />
          <p className={styles.accessLevel}>{mapProjectAccessLevel[member.accessLevel]}</p>
          <p className={styles.email}>{member.user.email}</p>
          <div className={styles.added}>
            <IconDate className="icon-small" />
            <p className={styles.addedValue}>{`ACTIVE FROM: ${formatDate(new Date(member.addedDate), true)}`}</p>
          </div>
        </div>
        <div className={styles.form}>
          <p className={styles.lastActivityTitle}>LAST ACTIVITY</p>
          {member.user.lastActivity ? (
            <div className={styles.lastActivity}>
              <IconTime className="icon-small" />
              <p className={styles.lastActivityValue}>{`${formatDate(new Date(member.user.lastActivity), true)}`}</p>
            </div>
          ) : (
            <p>User has no activity yet</p>
          )}
          <Select
            label="What access level does the user have?"
            options={Object.keys(AccessLevel)}
            valuesMapper={mapProjectAccessLevel}
            formSelectedOption={watch('accessLevel')}
            className={styles.formAccessLevel}
            onChange={(value: AccessLevel) => {
              setDone(false);
              setValue('accessLevel', value);
            }}
            disabled={!canManageMember}
            hideError
          />
          {canManageMember && (
            <div className={styles.removeButtonContainer}>
              <ConfirmAction
                title="DELETE MEMBER FROM PROJECT"
                subtitle={`Are you sure you want to remove the member "${member.user.email}"`}
                action={handleRemoveMember}
                actionLabel="REMOVE"
                warning
              >
                <Button label="Remove from project" Icon={IconRemove} className={styles.removeButton} />
              </ConfirmAction>
            </div>
          )}
        </div>
      </div>
      {canManageMember && (
        <ActionsBar className={styles.actions}>
          <Button
            label="Save"
            onClick={handleSubmit(handleUpdateMember)}
            disabled={!done && !accessLevelChanged}
            success={done}
            primary
          />
          <Button label="Cancel" onClick={close} />
        </ActionsBar>
      )}
    </div>
  );
}

export default MemberDetails;
