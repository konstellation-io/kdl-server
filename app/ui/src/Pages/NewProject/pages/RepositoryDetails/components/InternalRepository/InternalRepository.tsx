import { CHECK, TextInput } from 'kwc';
import React from 'react';

import { CONFIG } from 'index';
import IconLink from '@material-ui/icons/Link';
import styles from './InternalRepository.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import { useReactiveVar } from '@apollo/client';
import { getErrorMsg } from 'Utils/string';
import { newProject } from 'Graphql/client/cache';
import { validateSlug } from './InternalRepositoryUtils';

type Props = {
  showErrors: boolean;
};
function InternalRepository({ showErrors }: Props) {
  const {
    internalRepository: { values },
    internalRepository: { errors },
  } = useReactiveVar(newProject);
  const { updateValue, updateError, clearError } = useNewProject(
    'internalRepository'
  );

  const slug = values.slug;
  const slugError = errors.slug;

  const slugOk = getErrorMsg(validateSlug(slug));

  return (
    <div className={styles.repositoryInternal}>
      <div className={styles.url}>
        <p className={styles.urlTitle}>repository url</p>
        <div className={styles.serverUrlContainer}>
          <IconLink className="icon-regular" />
          <span
            className={styles.urlContent}
          >{`${CONFIG.GITEA_URL}/kdl/`}</span>
        </div>
      </div>
      <TextInput
        label="repository name"
        customClassname={styles.slug}
        onChange={(value: string) => {
          updateValue('slug', value);
          clearError('slug');
        }}
        onBlur={() => updateError('slug', slugOk)}
        formValue={slug}
        error={showErrors ? slugError : ''}
        helpText="Please write in a URL compatible way"
        showClearButton
      />
    </div>
  );
}

export default InternalRepository;
