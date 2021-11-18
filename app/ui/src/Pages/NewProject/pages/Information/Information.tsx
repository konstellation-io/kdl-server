import { ErrorMessage, SpinnerCircular, TextInput } from 'kwc';
import { generateSlug, getErrorMsg } from 'Utils/string';
import {
  validateProjectDescription,
  validateProjectId,
  validateProjectName,
} from './InformationUtils';

import DescriptionScore from 'Components/DescriptionScore/DescriptionScore';
import React from 'react';
import { newProject } from 'Graphql/client/cache';
import styles from './Information.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import useQualityDescription from 'Hooks/useQualityDescription/useQualityDescription';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GetProjects } from 'Graphql/queries/types/GetProjects';
import GetProjectsQuery from 'Graphql/queries/getProjects';
import { CONFIG } from 'index';

const limits = {
  maxHeight: 400,
  minHeight: 375,
};

type Props = {
  showErrors: boolean;
};
function Information({ showErrors }: Props) {
  const project = useReactiveVar(newProject);
  const { updateValue, updateError, clearError } = useNewProject('information');

  const { values, errors } = project.information;
  const { name, description, id } = values;
  const {
    name: errorName,
    description: errorDescription,
    id: errorId,
  } = errors;

  const { data, loading, error } = useQuery<GetProjects>(GetProjectsQuery);
  const {
    descriptionScore,
    loading: loadingQualityDescription,
  } = useQualityDescription(description);

  if (loading) return <SpinnerCircular />;
  if (!data || error) return <ErrorMessage />;

  function handleNameChange(newName: string) {
    const generatedId = generateSlug(newName);
    updateValue('name', newName);
    updateValue('id', generatedId);
    clearError('name');
    clearError('id');
  }

  function validateName() {
    if (data) {
      const projectsNames = data.projects.map((p) => p.name);
      const isValidName = validateProjectName(name, projectsNames);
      updateError('name', getErrorMsg(isValidName));
    }
  }

  function validateId() {
    if (data) {
      const projectsIds = data.projects.map((p) => p.id);
      const isValidId = validateProjectId(id, projectsIds);
      updateError('id', getErrorMsg(isValidId));
    }
  }

  return (
    <div className={styles.container} data-testid="informationInputs">
      <TextInput
        label="project name"
        onChange={handleNameChange}
        onBlur={() => {
          validateName();
          validateId();
        }}
        formValue={name}
        autoFocus
        showClearButton
        error={showErrors ? errorName : ''}
      />
      <TextInput
        label="project id"
        onChange={(v: string) => {
          updateValue('id', v);
          clearError('id');
        }}
        onBlur={validateId}
        formValue={id}
        showClearButton
        error={showErrors ? errorId : ''}
        helpText="Once the project is created you cannot change this id"
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
        }}
        limits={limits}
        error={showErrors ? errorDescription : ''}
        helpText={
          CONFIG.KNOWLEDGE_GALAXY_ENABLED
            ? `A minimum of ${CONFIG.DESCRIPTION_MIN_WORDS} words is required to get a valid score. Words: ${description.split(' ').length}`
            : ''
        }
        showClearButton
        textArea
        lockHorizontalGrowth
      />
        { CONFIG.KNOWLEDGE_GALAXY_ENABLED && <DescriptionScore
        score={descriptionScore}
        loading={loadingQualityDescription}
      /> }
    </div>
  );
}

export default Information;
