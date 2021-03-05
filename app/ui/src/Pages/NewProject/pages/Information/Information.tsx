import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';
import {
  GetQualityProjectDesc,
  GetQualityProjectDescVariables,
} from 'Graphql/queries/types/GetQualityProjectDesc';
import React, { useEffect, useState } from 'react';
import { SpinnerCircular, TextInput } from 'kwc';
import { useLazyQuery, useQuery } from '@apollo/client';

import DescriptionScore from 'Components/DescriptionScore/DescriptionScore';
import { generateSlug, getErrorMsg } from 'Utils/string';
import { loader } from 'graphql.macro';
import styles from './Information.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import {
  validateProjectDescription,
  validateProjectName,
} from './InformationUtils';

const GetQualityProjectDescQuery = loader(
  'Graphql/queries/getQualityProjectDesc.graphql'
);

const limits = {
  maxHeight: 500,
  minHeight: 400,
};

type Props = {
  showErrors: boolean;
};
function Information({ showErrors }: Props) {
  const [getQualityProjectDesc, { data: descriptionScore }] = useLazyQuery<
    GetQualityProjectDesc,
    GetQualityProjectDescVariables
  >(GetQualityProjectDescQuery);

  const { updateValue, updateError, clearError } = useNewProject('information');
  const { updateValue: updateInternalRepositoryValue } = useNewProject(
    'internalRepository'
  );
  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (descriptionScore !== undefined)
      setScore(descriptionScore.qualityProjectDesc.quality || 0);
  }, [descriptionScore]);

  if (!data) return <SpinnerCircular />;

  const {
    values: { name, description },
    errors: { name: errorName, description: errorDescription },
  } = data.newProject.information;

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
          getQualityProjectDesc({ variables: { description } });
        }}
        limits={limits}
        showClearButton
        textArea
        lockHorizontalGrowth
        error={showErrors ? errorDescription : ''}
      />
      <DescriptionScore score={score} />
    </div>
  );
}

export default Information;
