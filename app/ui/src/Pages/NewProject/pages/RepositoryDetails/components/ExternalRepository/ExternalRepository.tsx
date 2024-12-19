import { SpinnerCircular, TextInput, Select } from 'kwc';
import * as React from 'react';
import IconLink from '@material-ui/icons/Link';
import styles from './ExternalRepository.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';
import { validateMandatoryField, validateUrl } from './ExternalRepositoryUtils';
import { getErrorMsg } from 'Utils/string';

type Props = {
  showErrors: boolean;
};

function ExternalRepository({ showErrors }: Props) {
  const project = useReactiveVar(newProject);
  const { updateValue, updateError, clearError } = useNewProject('externalRepository');

  if (!project) return <SpinnerCircular />;

  const {
    values: { url, username },
    errors: { url: urlError, username: usernameError },
  } = project.externalRepository;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Your external repository</h3>
      <div className={styles.formContainer} data-testid={'externalRepositoryInputs'}>
        <TextInput
          label="url"
          onChange={(value: string) => {
            updateValue('url', value);
            clearError('url');
          }}
          onBlur={() => {
            const isValidUrl = validateUrl(url);
            updateError('url', getErrorMsg(isValidUrl));
          }}
          error={showErrors ? urlError : ''}
          customClassname={styles.form}
          formValue={url}
          Icon={IconLink}
          showClearButton
          helpText="The HTTP(S) or GIT 'clone' URL of an existing repository."
        />
        <TextInput
          label="username"
          onChange={(value: string) => {
            updateValue('username', value);
            clearError('username');
          }}
          onBlur={() => {
            const isValidUsername = validateMandatoryField(username);
            updateError('username', getErrorMsg(isValidUsername));
          }}
          error={showErrors ? usernameError : ''}
          customClassname={styles.form}
          formValue={username}
          showClearButton
        />
      </div>
    </div>
  );
}

export default ExternalRepository;
