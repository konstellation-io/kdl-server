import { TextInput } from 'kwc';
import React, { useEffect } from 'react';
import styles from './UpdateInternalRepo.module.scss';
import { useForm } from 'react-hook-form';
import FormPanel from 'Components/FormPanel/FormPanel';
import stylesUpdateRepo from '../../UpdateRepository.module.scss';
import IconLink from '@material-ui/icons/Link';
import { CONFIG } from 'index';
import { validateSlug } from '../../../../../NewProject/pages/RepositoryDetails/components/InternalRepository/InternalRepositoryUtils';
import { UpdateRepoProps } from '../../UpdateRepository';
import useProject from 'Graphql/hooks/useProject';
import { UpdateInternalRepositoryInput } from 'Graphql/types/globalTypes';

function UpdateInternalRepo({ close, project }: UpdateRepoProps) {
  const { updateProjectInternalRepo } = useProject();

  const url = project.repository?.url || '';
  const extractedSlug = url.split('/').pop();

  const {
    handleSubmit,
    errors,
    register,
    watch,
    setValue,
    unregister,
  } = useForm({
    defaultValues: {
      slug: extractedSlug,
    },
  });

  useEffect(() => {
    register('slug', {
      required: 'This field is mandatory',
      validate: validateSlug,
    });
    return () => unregister(['slug']);
  }, []);

  const slug = watch('slug');
  const { slug: slugError } = errors;

  function onSubmit(data: UpdateInternalRepositoryInput) {
    updateProjectInternalRepo(project.id, data);
  }

  return (
    <FormPanel
      onSave={handleSubmit(onSubmit)}
      onClose={close}
      actionsClass={stylesUpdateRepo.actions}
    >
      <div className={styles.container}>
        <div className={styles.url}>
          <p className={styles.urlTitle}>repository url</p>
          <div className={styles.serverUrlContainer}>
            <IconLink className="icon-regular" />
            <span
              className={styles.urlContent}
            >{`${CONFIG.INTERNAL_REPO_BASE_URL}/`}</span>
          </div>
        </div>
        <TextInput
          customClassname={styles.slugInput}
          label="repository name"
          onChange={(value: string) => setValue('slug', value)}
          error={slugError && slugError.message}
          formValue={slug}
          autoFocus
          showClearButton
        />
      </div>
    </FormPanel>
  );
}

export default UpdateInternalRepo;
