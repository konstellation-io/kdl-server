import React from 'react';
import StepNode from './StepNode';
import styles from './Stepper.module.scss';

export type Step = {
  completed: boolean;
  error: boolean;
  label: string;
  id: number;
  active: boolean;
  visited: boolean;
  disabled: boolean;
};

type Props = {
  steps: Step[];
  activeStep: number;
  onStepClick: Function;
};
function Stepper({ steps, onStepClick }: Props) {
  return (
    <div className={styles.container}>
      {steps.map((step, idx) => (
        <StepNode
          {...step}
          key={idx}
          onClick={() => {
            if (!step.disabled) onStepClick(step.id);
          }}
        />
      ))}
    </div>
  );
}

export default Stepper;
