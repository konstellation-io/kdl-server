import { Button, CHECK, Check, TextInput } from 'kwc';
import CircledInfoMessage, {
  CircledInfoMessageTypes,
} from 'Components/CircledInfoMessage/CircledInfoMessage';
import React, { useEffect } from 'react';

import ActionsBar from 'Components/Layout/ActionsBar/ActionsBar';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import IconInfo from '@material-ui/icons/Info';
import IconLink from '@material-ui/icons/Link';
import styles from './UpdateRepository.module.scss';
import useBoolState from 'Hooks/useBoolState';
import { useForm } from 'react-hook-form';
import useProject from 'Graphql/hooks/useProject';

function validateUrl(value: string) {
  const error = CHECK.getValidationError([CHECK.isDomainValid(value)]);
  return error === true ? undefined : (error as string);
}

type FormData = {
  url: string;
  skipTest: boolean;
};

type Props = {
  project: GetProjects_projects;
  close: () => void;
};
function UpdateRepository({ project, close }: Props) {
  const {
    value: loading,
    activate: showLoading,
    deactivate: hideLoading,
  } = useBoolState(false);
  const { value: connectionOk, deactivate: setConnectionNotOk } = useBoolState(
    false
  );

  const { updateProjectRepositoryUrl } = useProject();

  const {
    handleSubmit,
    setValue,
    setError,
    unregister,
    register,
    watch,
    errors,
  } = useForm<FormData>({
    defaultValues: { url: project.repository?.url, skipTest: false },
  });

  useEffect(() => {
    register('url', { validate: validateUrl });
    register('skipTest');

    return () => {
      unregister('url');
      unregister('skipTest');
    };
  }, [register, unregister]);

  function onSubmit() {
    showLoading();

    // TODO: validate connection with server
    setTimeout(() => {
      setConnectionNotOk();
      setError('url', { type: 'connection', message: 'cannot connect' });
      hideLoading();
    }, 3000);
  }

  const url = watch('url');

  function handleOnSave() {
    updateProjectRepositoryUrl(project.id, url);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Test your URL</h1>
        <div className={styles.subtitle}>
          <p className={styles.subtitleText}>
            Make sure you have your public SSH key in the external repository.
          </p>
          <Button label="" Icon={IconInfo} />
        </div>
        <div className={styles.form}>
          <div className={styles.formUrl}>
            <TextInput
              label="project repository"
              Icon={IconLink}
              helpText="PLEASE, WRITE IN A URL COMPATIBLE WAY"
              onChange={(value: string) => setValue('url', value)}
              error={
                (errors.url?.type === 'validate' && errors.url.message) || ''
              }
              onEnterKeyPress={handleSubmit(onSubmit)}
              formValue={url}
              autoFocus
              showClearButton
            />
          </div>
          <Button
            label="TEST"
            className={styles.testButton}
            onClick={handleSubmit(onSubmit)}
            loading={loading}
            border
          />
        </div>
        {connectionOk && <p className={styles.connectionOk}>Connection Ok</p>}
        {errors.url?.type === 'connection' && (
          <CircledInfoMessage
            type={CircledInfoMessageTypes.ERROR}
            text="Connection error"
          >
            <div className={styles.arrow} />
            <div className={styles.warningBox}>
              <h6 className={styles.title}>Nam dapibus nisl vitae.</h6>
              <p className={styles.message}>{errors.url.message}</p>
              <div className={styles.checkContainer}>
                <Check
                  className={styles.testCheck}
                  checked={watch('skipTest')}
                  onChange={(checked) => setValue('skipTest', checked)}
                />
                <span className={styles.checkLabel}>I understand that</span>
              </div>
            </div>
          </CircledInfoMessage>
        )}
      </div>
      <ActionsBar className={styles.actions}>
        <Button
          label="SAVE"
          onClick={handleOnSave}
          disabled={!(connectionOk || (!connectionOk && watch('skipTest')))}
          primary
        />
        <Button label="CANCEL" onClick={close} />
      </ActionsBar>
    </div>
  );
}

export default UpdateRepository;
