import { Button, CHECK, Check, Select, TextInput } from 'kwc';
import React, { useEffect } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import DefaultPage from 'Components/Layout/Page/DefaultPage/DefaultPage';
import ROUTE from 'Constants/routes';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './NewUser.module.scss';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import useUser from 'Graphql/hooks/useUser';

function verifyEmail(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isEmailValid(value),
  ]);
}

function verifyAccessLevel(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldNotInList(value, Object.values(AccessLevel)),
  ]);
}

function verifyConfirmation(value: boolean) {
  return value ? true : 'You need to accept this';
}

type FormData = {
  email: string;
  accessLevel: AccessLevel;
  confirmation: boolean;
};

function NewUser() {
  const history = useHistory();

  const {
    handleSubmit,
    setValue,
    register,
    unregister,
    errors,
    setError,
    clearErrors,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      accessLevel: AccessLevel.VIEWER,
      confirmation: false,
    },
  });
  const {
    addNewUser,
    add: { loading, error: errorAddUser },
  } = useUser(() => history.push(ROUTE.USERS));

  useEffect(() => {
    register('email', { validate: verifyEmail });
    register('confirmation', { validate: verifyConfirmation });
    register('accessLevel', { required: true, validate: verifyAccessLevel });

    return () => {
      unregister('email');
      unregister('confirmation');
      unregister('accessLevel');
    };
  }, [register, unregister, setValue]);

  useEffect(() => {
    if (errorAddUser) {
      setError('email', errorAddUser);
    }
  }, [errorAddUser, setError]);

  const actions = [
    <Button
      label="CANCEL"
      key="cancel"
      onClick={() => history.goBack()}
      tabIndex={0}
      className={styles.buttonCancel}
    />,
    <Button
      primary
      key="add"
      label="ADD"
      onClick={handleSubmit(addNewUser)}
      loading={loading}
      className={styles.buttonSave}
      tabIndex={0}
    />,
  ];

  return (
    <DefaultPage
      title="Add a new user"
      subtitle="Added user will have access to the server. If a user not included in the server tries to access it,
        they will not receive the sign in email, instead an error will be returned."
      actions={actions}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>Please introduce a new user</h2>
        <p className={styles.subtitle}>
          Only an email address is required. By default, the new user will only
          have VIEWER privileges and no changes will be allowed to be performed
          by him, you can change this behavior by updating the USER TYPE
          selector.
        </p>
        <div className={styles.content}>
          <TextInput
            whiteColor
            label="email"
            placeholder="New user email"
            error={get(errors.email, 'message') as string}
            onChange={(value: string) => {
              clearErrors('email');
              setValue('email', value);
            }}
            onEnterKeyPress={handleSubmit(addNewUser)}
            autoFocus
          />
          <Select
            label="User type"
            showSelectAllOption={false}
            options={Object.values(AccessLevel)}
            onChange={(value: AccessLevel) => setValue('accessLevel', value)}
            error={get(errors.accessLevel, 'message') as string}
            formSelectedOption={watch('accessLevel')}
            placeholder="Access level"
          />
          <div
            className={cx(styles.disclaimer, {
              [styles.disclaimerError]: errors?.confirmation?.message,
            })}
          >
            <p className={styles.disclaimerTitle}>Please be careful</p>
            <p className={styles.disclaimerDesc}>
              Depending on the users role, they might be able to create new
              proyects, use server resources or change the server users list.
              Make sure to add users with their expected role.
            </p>
            <div className={styles.formConfirmation}>
              <Check
                checked={watch('confirmation')}
                onChange={(checked) => {
                  clearErrors('confirmation');
                  setValue('confirmation', checked);
                }}
              />
              <p className={styles.disclaimerLabel}>Sure, I will do it.</p>
            </div>
          </div>
          <div className={styles.error}>{errors?.confirmation?.message}</div>
        </div>
      </div>
    </DefaultPage>
  );
}

export default NewUser;
