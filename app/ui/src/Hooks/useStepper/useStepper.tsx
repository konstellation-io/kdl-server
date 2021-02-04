import React, { MouseEvent, useState } from 'react';

import { Button } from 'kwc';
import { cloneDeep } from 'lodash';
import styles from './useStepper.module.scss';
import useNavigation from 'Hooks/useNavigation';

export enum ActionButtonTypes {
  Back = 'Back',
  Next = 'Next',
  Complete = 'Complete',
  Cancel = 'Cancel',
}

export type ActionButtonProps = {
  label: string;
  onClick?: (e?: MouseEvent<HTMLDivElement> | undefined) => void;
  to?: string;
  primary?: boolean;
  disabled?: boolean;
};

export const ActionButton = (props: ActionButtonProps) => (
  <div className={styles.actionButton}>
    <Button {...props} />
  </div>
);

type Step = {
  id: string;
  completed: boolean;
  error: boolean;
};

type Data = {
  id: string;
  Component: any;
};

const buildSteps = (data: Data[]): Step[] =>
  data.map((d) => ({
    id: d.id,
    completed: false,
    error: false,
  }));

type Params = {
  data: Data[];
  initialStep?: number;
};
export default function useStepper({ data, initialStep = 0 }: Params) {
  const [steps, setSteps] = useState(buildSteps(data));
  const { actStep, goToStep, nextStep, prevStep, direction } = useNavigation({
    initialStep,
    maxSteps: steps.length,
  });

  function getActStepComponent() {
    const Component = data[actStep].Component;
    const showErrors = steps[actStep].error;
    return <Component showErrors={showErrors} />;
  }

  function updateState(
    completed: boolean,
    error: boolean,
    stepNumber: number = actStep
  ) {
    const newSteps = cloneDeep(steps);
    newSteps[stepNumber] = {
      ...newSteps[stepNumber],
      completed,
      error,
    };

    setSteps(newSteps);
  }

  return {
    actStep,
    goToStep,
    direction,
    nextStep,
    prevStep,
    updateState,
    getActStepComponent,
    steps,
  };
}
