import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';
import { SpinnerCircular, TextInput } from 'kwc';

import React from 'react';
import { generateSlug } from 'Utils/string';
import styles from './Information.module.scss';
import useNewProject from 'Graphql/client/hooks/useNewProject';
import { useLazyQuery, useQuery } from '@apollo/client';
import DescriptionScore from './components/DescriptionScore/DescriptionScore';
import {
  GetQualityProjectDesc,
  GetQualityProjectDescVariables,
} from 'Graphql/queries/types/GetQualityProjectDesc';
import { loader } from 'graphql.macro';

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
          updateError(
            'name',
            name.length === 0 ? 'This field is mandatory, please fill it.' : ''
          );
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
          updateError(
            'description',
            description.length === 0
              ? 'Please, write a description is important for the project'
              : ''
          );
          getQualityProjectDesc({ variables: { description } });
        }}
        limits={limits}
        showClearButton
        textArea
        lockHorizontalGrowth
        error={showErrors ? errorDescription : ''}
      />
      <DescriptionScore
        score={descriptionScore?.qualityProjectDesc.quality || 0}
      />
    </div>
  );
}

export default Information;
