import { Button, Select } from 'kwc';
import React, { useEffect, useState } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import ActionsBar from 'Components/Layout/ActionsBar/ActionsBar';
import ConfirmAction from 'Components/Layout/ConfirmAction/ConfirmAction';
import Gravatar from 'react-gravatar';
import IconDate from '@material-ui/icons/Today';
import IconRemove from '@material-ui/icons/Delete';
import IconTime from '@material-ui/icons/Schedule';
import { MemberDetails } from 'Pages/Home/apollo/models/MemberDetails';
import { formatDate } from 'Utils/format';
import styles from './MemberDetails.module.scss';
import { useForm } from 'react-hook-form';
import useMember from 'Graphql/hooks/useMember';

const gravatarStyle = {
  borderRadius: '50%',
};

type FormData = {
  accessLevel: AccessLevel;
};

type Props = {
  member: MemberDetails;
  projectId: string;
  close: () => void;
};
function MemberDetail({ member, projectId, close }: Props) {
  const [done, setDone] = useState(false);
  const { removeMemberById, updateMemberAccessLevel } = useMember(projectId, {
    onCompleteUpdate: () => setDone(true),
  });

  const { handleSubmit, setValue, unregister, register, watch } = useForm<
    FormData
  >({
    defaultValues: { accessLevel: member.accessLevel },
  });

  useEffect(() => {
    register('accessLevel');

    return () => unregister('accessLevel');
  }, [register, unregister]);

  useEffect(() => {
    setValue('accessLevel', member.accessLevel);
  }, [member, setValue]);

  const accessLevelChanged = member.accessLevel !== watch('accessLevel');

  function handleUpdateMember({ accessLevel }: FormData) {
    if (accessLevelChanged) {
      updateMemberAccessLevel(member.id, accessLevel);
    }
  }
  function handleRemoveMember() {
    removeMemberById(member.id);
    close();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.info}>
          <Gravatar email={member.email} size={160} style={gravatarStyle} />
          <p className={styles.accessLevel}>{member.accessLevel}</p>
          <p className={styles.email}>{member.email}</p>
          <div className={styles.added}>
            <IconDate className="icon-small" />
            <p className={styles.addedValue}>
              {`ACTIVE FROM: ${formatDate(new Date(member.addedDate), true)}`}
            </p>
          </div>
        </div>
        <div className={styles.form}>
          <p className={styles.lastActivityTitle}>LAST ACTIVITY</p>
          {member.lastActivity ? (
            <div className={styles.lastActivity}>
              <IconTime className="icon-small" />
              <p className={styles.lastActivityValue}>
                {`${formatDate(new Date(member.lastActivity), true)}`}
              </p>
            </div>
          ) : (
            <p>User has no activity yet</p>
          )}
          <Select
            label="What access level does the user have?"
            options={Object.values(AccessLevel)}
            formSelectedOption={watch('accessLevel')}
            className={styles.formAccessLevel}
            onChange={(value: AccessLevel) => {
              setDone(false);
              setValue('accessLevel', value);
            }}
            hideError
          />
          <div className={styles.removeButtonContainer}>
            <ConfirmAction
              title="DELETE MEMBER FROM PROJECT"
              subtitle={`Are you sure you want to remove the member "${member.email}"`}
              action={handleRemoveMember}
              actionLabel="REMOVE"
              warning
            >
              <Button
                label="REMOVE FROM PROYECT"
                Icon={IconRemove}
                className={styles.removeButton}
              />
            </ConfirmAction>
          </div>
        </div>
      </div>
      <ActionsBar className={styles.actions}>
        <Button
          label="SAVE"
          onClick={handleSubmit(handleUpdateMember)}
          disabled={!done && !accessLevelChanged}
          success={done}
          primary
        />
        <Button label="CANCEL" onClick={close} />
      </ActionsBar>
    </div>
  );
}

export default MemberDetail;
