import React from 'react';
import { SpinnerCircular, TextInput } from 'kwc';
import { useReactiveVar } from '@apollo/client';

import DescriptionScore from 'Components/DescriptionScore/DescriptionScore';
import { generateSlug, getErrorMsg } from 'Utils/string';
import styles from './Information.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import {
  validateProjectDescription,
  validateProjectName,
} from './InformationUtils';
import { newProject } from 'Graphql/client/cache';
import useQualityDescription from 'Hooks/useQualityDescription/useQualityDescription';

const limits = {
  maxHeight: 500,
  minHeight: 400,
};

type Props = {
  showErrors: boolean;
};
function Information({ showErrors }: Props) {
  const project = useReactiveVar(newProject);
  const { updateValue, updateError, clearError } = useNewProject('information');
  const { updateValue: updateInternalRepositoryValue } = useNewProject(
    'internalRepository'
  );

  const { values, errors } = project.information || {};
  const { name, description } = values;
  const { name: errorName, description: errorDescription } = errors;

  const { descriptionScore, fetchDescriptionScore } = useQualityDescription(
    description
  );

  if (!project) return <SpinnerCircular />;

  return (
    <div className={styles.container}>
      <TextInput
        label="project name"
        onChange={(v: string) => {
          updateValue('name', v);
          clearError('name');
        }}
        onBlur={() => {
          updateInternalRepositoryValue('slug', generateSlug(name));
          const isValidName = validateProjectName(name);
          updateError('name', getErrorMsg(isValidName));
        }}
        formValue={name}
        autoFocus
        showClearButton
        error={showErrors ? errorName : ''}
      />
      <TextInput
        label="project description"
        formValue={description}
        onChange={(v: string) => {
          updateValue('description', v);
          clearError('description');
        }}
        onBlur={() => {
          const isValidDescription = validateProjectDescription(description);
          updateError('description', getErrorMsg(isValidDescription));
          fetchDescriptionScore();
        }}
        limits={limits}
        showClearButton
        textArea
        lockHorizontalGrowth
        error={showErrors ? errorDescription : ''}
      />
      <DescriptionScore score={descriptionScore} />
    </div>
  );
}

export default Information;
