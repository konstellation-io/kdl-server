import { Button, TextInput } from 'kwc';
import React, { useEffect, useState } from 'react';

import ActionsBar from 'Components/Layout/ActionsBar/ActionsBar';
import DescriptionScore from 'Components/DescriptionScore/DescriptionScore';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import styles from './UpdateProjectDescription.module.scss';
import { useForm } from 'react-hook-form';
import useProject from 'Graphql/hooks/useProject';
import useQualityDescription from 'Hooks/useQualityDescription/useQualityDescription';

type FormData = {
  description: string;
};

type Props = {
  project: GetProjects_projects;
  close: () => void;
};
function UpdateProjectDescription({ project, close }: Props) {
  const [completed, setCompleted] = useState(false);

  const { updateProjectDescription } = useProject({
    onUpdateCompleted: () => setCompleted(true),
  });

  const {
    handleSubmit,
    clearErrors,
    setValue,
    unregister,
    register,
    watch,
    errors,
  } = useForm<FormData>({
    defaultValues: { description: project.description },
  });

  useEffect(() => {
    register('description', { required: true });

    return () => {
      unregister('description');
    };
  }, [register, unregister]);

  const descriptionValue = watch('description');

  const { descriptionScore, fetchDescriptionScore } = useQualityDescription(
    descriptionValue,
    {
      skipFirstRun: false,
    }
  );

  function submit({ description }: FormData) {
    updateProjectDescription(project.id, description);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.descriptionLabel}>
          Write a detailed description for your project. This description is
          used by the Knowledge Graph to generate the recommendations. The more
          detailed the description is, the better the descriptions are.
        </div>
      </div>
      <div className={styles.formInput}>
        <TextInput
          formValue={descriptionValue}
          onChange={(v: string) => {
            setValue('description', v);
            setCompleted(false);
            clearErrors();
          }}
          onBlur={fetchDescriptionScore}
          error={errors.description?.message}
          whiteColor
          textArea
          lockHorizontalGrowth
        />
      </div>
      <div className={styles.score}>
        <DescriptionScore score={descriptionScore} />
      </div>
      <ActionsBar className={styles.actions}>
        <Button
          label="SAVE"
          onClick={handleSubmit(submit)}
          disabled={!completed && descriptionValue === project.description}
          success={completed}
          primary
        />
        <Button label="CANCEL" onClick={close} />
      </ActionsBar>
    </div>
  );
}

export default UpdateProjectDescription;
