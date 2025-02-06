import { useEffect } from 'react';
import { SearchSelect, Select } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers } from 'Graphql/queries/types/GetUsers';
import { get } from 'lodash';
import styles from './UserFiltersAndActions.module.scss';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import useUserSettings from 'Graphql/client/hooks/useUserSettings';

import GetUsersQuery from 'Graphql/queries/getUsers';
import { mapAccessLevel } from 'Utils/accessLevel';

type FormData = {
  userEmail?: string;
  userType?: AccessLevel;
};

function UserFilters() {
  const { updateFilters } = useUserSettings();

  const { data } = useQuery<GetUsers>(GetUsersQuery);

  const {
    handleSubmit,
    register,
    unregister,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormData>();
  const users = [...new Set(data?.users.map((user) => user.email))];

  useEffect(() => {
    register('userEmail');
    register('userType');

    return () => {
      unregister('userEmail');
      unregister('userType');
    };
  }, [register, unregister]);

  function onSubmit(formData: FormData) {
    updateFilters(formData.userEmail, formData.userType);
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterUsers}>
        <SearchSelect
          label="Search"
          name="userEmail"
          options={users}
          onChange={(value: string) => setValue('userEmail', value)}
          onEnter={handleSubmit(onSubmit)}
          placeholder="User email"
          error={get(errors.userEmail, 'message') as string}
          value={watch('userEmail')}
        />
      </div>
      <div className={styles.filterTypes}>
        <Select
          label="User type"
          options={Object.keys(AccessLevel)}
          onChange={(value: AccessLevel) => {
            setValue('userType', value);
            handleSubmit(onSubmit)();
          }}
          error={get(errors.userType, 'message') as string}
          formSelectedOption={watch('userType')}
          placeholder="Access Level"
        />
      </div>
    </div>
  );
}

export default UserFilters;
