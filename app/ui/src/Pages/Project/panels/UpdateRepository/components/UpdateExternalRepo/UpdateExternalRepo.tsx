import { TextInput } from 'kwc';
import React, { useEffect } from 'react';
import styles from './UpdateExternalRepo.module.scss';
import { useForm } from 'react-hook-form';
import { validateUrl } from '../../../../../NewProject/pages/RepositoryDetails/components/ExternalRepository/ExternalRepositoryUtils';
import FormPanel from 'Components/FormPanel/FormPanel';
import useProject from 'Graphql/hooks/useProject';
import stylesUpdateRepo from '../../UpdateRepository.module.scss';
import IconLink from '@material-ui/icons/Link';
import { UpdateRepoProps } from '../../UpdateRepository';
import { UpdateExternalRepositoryInput } from 'Graphql/types/globalTypes';

const DEFAULT_TOKEN = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';

function UpdateExternalRepo({ close, project }: UpdateRepoProps) {
  const { updateProjectExternalRepo } = useProject();
  const {
    handleSubmit,
    errors,
    register,
    watch,
    setValue,
    unregister,
  } = useForm({
    defaultValues: {
      url: project.repository?.url,
      username: project.repository?.external?.username,
      token: DEFAULT_TOKEN,
    },
  });

  useEffect(() => {
    register('url', {
      required: 'This field is mandatory',
      validate: validateUrl,
    });
    register('username', { required: 'This field is mandatory' });
    register('token', { required: 'This field is mandatory' });
    return () => unregister(['url', 'username', 'token']);
  }, [register, unregister]);

  const { url, username, token } = watch(['url', 'username', 'token']);
  const { url: urlError, username: usernameError, token: tokenError } = errors;

  function onSubmit(data: UpdateExternalRepositoryInput) {
    const input: UpdateExternalRepositoryInput = {
      ...data,
      token: data.token !== DEFAULT_TOKEN ? data.token : '',
    };
    updateProjectExternalRepo(project.id, input);
  }

  return (
    <FormPanel
      onSave={handleSubmit(onSubmit)}
      onClose={close}
      actionsClass={stylesUpdateRepo.actions}
    >
      <div className={styles.container}>
        <TextInput
          label="project repository"
          helpText="The HTTP(S) or GIT 'clone' URL of an existing repository."
          onChange={(value: string) => setValue('url', value)}
          error={urlError && urlError.message}
          Icon={IconLink}
          formValue={url}
          showClearButton
        />
        <TextInput
          label="username"
          onChange={(value: string) => setValue('username', value)}
          error={usernameError && usernameError.message}
          formValue={username}
          showClearButton
        />
        <TextInput
          label="token"
          onChange={(value: string) => setValue('token', value)}
          error={tokenError && tokenError.message}
          formValue={token}
          showClearButton
          hidden
          hidePwEye
        />
      </div>
    </FormPanel>
  );
}

export default UpdateExternalRepo;
