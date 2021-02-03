import { Button, CHECK, Check, SpinnerCircular, TextInput } from 'kwc';
import CircledInfoMessage, {
  CircledInfoMessageTypes,
} from 'Components/CircledInfoMessage/CircledInfoMessage';
import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';
import React, { useState } from 'react';

import IconLink from '@material-ui/icons/Link';
import styles from './ExternalRepository.module.scss';
import useNewProject from '../../../../../../apollo/hooks/useNewProject';
import { useQuery } from '@apollo/client';

function validateUrl(value: string): string {
  const error = CHECK.getValidationError([CHECK.isDomainValid(value)]);
  return error === true ? '' : (error as string);
}

type Props = {
  showErrors: boolean;
};

function ExternalRepository({ showErrors }: Props) {
  const [loading, setLoading] = useState(false);
  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);
  const { updateValue, updateError, clearError } = useNewProject(
    'externalRepository'
  );

  if (!data) return <SpinnerCircular />;

  const {
    values: { url, isConnectionTested, warning, hasConnectionError },
    errors: { url: urlError },
  } = data.newProject.externalRepository;

  const isValidUrl = validateUrl(url);

  function validateConnection() {
    setLoading(true);

    // TODO: verify the url inserted
    setTimeout(() => {
      const success = false;
      setLoading(false);
      updateError('warning', success ? '' : 'not accepted');
      updateValue('warning', success);
      updateValue('hasConnectionError', success ? '' : 'error');
      updateValue('isConnectionTested', true);
    }, 500);
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Test your URL</h3>
      <p className={styles.subtitle}>
        Make sure you have your public Konstellation SSH key in the external
        repository.
      </p>
      <div className={styles.formUrlRow}>
        <TextInput
          label="url"
          onChange={(value: string) => {
            updateValue('url', value);
            updateValue('isConnectionTested', false);
            clearError('url');
          }}
          onBlur={() => {
            updateError('url', isValidUrl);
            updateError('warning', 'not accepted');
          }}
          error={url && urlError}
          customClassname={styles.formUrl}
          formValue={url}
          Icon={IconLink}
          showClearButton
        />
        <Button
          label="TEST"
          primary
          className={styles.testButton}
          onClick={validateConnection}
          disabled={isValidUrl !== ''}
          loading={loading}
        />
      </div>
      {isConnectionTested && !!hasConnectionError && (
        <CircledInfoMessage
          type={CircledInfoMessageTypes.ERROR}
          text="connection error"
        >
          <div className={styles.arrow} />
          <div className={styles.warningBox}>
            <h6 className={styles.title}>Repository connection failed.</h6>
            <p className={styles.message}>
              Make sure your SSH key is included in the repository. If not,
              access SSH Key section inside the Server Project list and follow
              the instructions. You may skip this process by checking the
              confirmation bellow.
            </p>
            <div className={styles.checkContainer}>
              <Check
                className={styles.testCheck}
                checked={warning}
                onChange={(checked) => {
                  updateError('warning', checked ? '' : 'not accepted');
                  updateValue('warning', checked);
                }}
              />
              <span className={styles.checkLabel}>
                Save my project without testing the url
              </span>
            </div>
          </div>
        </CircledInfoMessage>
      )}
    </div>
  );
}

export default ExternalRepository;
