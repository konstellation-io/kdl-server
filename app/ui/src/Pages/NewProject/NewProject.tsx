import { CSSTransition, TransitionGroup } from 'react-transition-group';
import React, { useEffect, useMemo, useState } from 'react';
import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from './pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';
import useStepper, { ActionButton } from 'Hooks/useStepper/useStepper';

import DefaultPage from 'Components/Layout/Page/DefaultPage/DefaultPage';
import Information from './pages/Information/Information';
import ROUTE from 'Constants/routes';
import Repository from './pages/Repository/Repository';
import RepositoryDetails from './pages/RepositoryDetails/RepositoryDetails';
import { RepositoryType } from 'Graphql/types/globalTypes';
import SidebarTop from 'Components/Layout/Page/DefaultPage/SidebarTop';
import Stepper from 'Components/Stepper/Stepper';
import Summary from './pages/Summary/Summary';
import cx from 'classnames';
import styles from './NewProject.module.scss';
import { useReactiveVar } from '@apollo/client';
import { Prompt } from 'react-router-dom';
import useUnloadPrompt from 'Hooks/useUnloadPrompt/useUnloadPrompt';
import { newProject } from 'Graphql/client/cache';

enum Steps {
  INFORMATION,
  REPOSITORY,
  REPOSITORY_DETAILS,
  SUMMARY,
}

enum StepNames {
  INFORMATION = 'information',
  REPOSITORY = 'repository',
  DETAILS = 'repository details',
  EXTERNAL = 'externalRepository',
  INTERNAL = 'internalRepository',
  SUMMARY = 'summary',
}

const stepperSteps = [
  {
    id: StepNames.INFORMATION,
    Component: Information,
  },
  {
    id: StepNames.REPOSITORY,
    Component: Repository,
  },
  {
    id: StepNames.DETAILS,
    Component: RepositoryDetails,
  },
  {
    id: StepNames.SUMMARY,
    Component: Summary,
  },
];

export const repoTypeToStepName: {
  [k: string]: StepNames.EXTERNAL;
} = {
  [RepositoryType.EXTERNAL]: StepNames.EXTERNAL,
};

function NewProject() {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isPromptEnabled, setIsPromptEnabled] = useState(false);

  const { enableUnloadPrompt, disableUnloadPrompt } = useUnloadPrompt();
  const data = useReactiveVar(newProject);

  const type = data.repository.values.type;

  const stepsWithData: (
    | StepNames.INFORMATION
    | StepNames.REPOSITORY
    | StepNames.EXTERNAL
  )[] = useMemo(() => {
    return [
      StepNames.INFORMATION,
      StepNames.REPOSITORY,
      repoTypeToStepName[type || ''],
    ];
  }, [type]);

  // We want to execute this on on component mount and unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => disableUnloadPrompt, []);

  const {
    direction,
    goToStep,
    actStep,
    getActStepComponent,
    updateState,
    nextStep,
    prevStep,
    steps,
  } = useStepper({
    data: stepperSteps,
  });

  useEffect(() => {
    const isSomeInputDirty = stepsWithData.some((step) => {
      const stepByIndex = data[step];
      return (
        stepByIndex &&
        Object.values(stepByIndex.values).some((value) => !!value)
      );
    });
    setIsFormDirty(isSomeInputDirty);
  }, [data, stepsWithData]);

  useEffect(() => {
    if (isFormDirty && actStep !== Steps.SUMMARY) {
      enableUnloadPrompt();
      setIsPromptEnabled(true);
    } else {
      disableUnloadPrompt();
      setIsPromptEnabled(false);
    }
  }, [
    isFormDirty,
    actStep,
    enableUnloadPrompt,
    disableUnloadPrompt,
    setIsPromptEnabled,
  ]);

  function getActions() {
    const onNextClick = () => {
      if (validateStep()) nextStep();
    };
    switch (actStep) {
      case 0:
        return [
          <ActionButton key="cancel" label="Cancel" to={ROUTE.HOME} />,
          <ActionButton
            key="next"
            label="Next"
            primary
            onClick={onNextClick}
          />,
        ];
      case stepperSteps.length - 1:
        return [
          <ActionButton key="key" label="Back" onClick={prevStep} />,
          <ActionButton
            key="create"
            label="Create"
            to={ROUTE.PROJECT_CREATION}
            primary
          />,
        ];
      default:
        return [
          <ActionButton key="back" label="Back" onClick={prevStep} />,
          <ActionButton
            key="next"
            label="Next"
            primary
            onClick={onNextClick}
          />,
        ];
    }
  }

  // Updates completed and error step states
  function validateStep() {
    const stepData = stepsWithData[actStep];
    const hasData = !!stepData;

    if (hasData && actStep !== Steps.SUMMARY) {
      const actStepData = data[stepData];

      const error =
        actStepData.errors && Object.values(actStepData.errors).some((e) => e);

      const values = Object.values(actStepData.values).filter(
        (v) => typeof v !== 'boolean'
      );
      const completed = values && values.every((v) => !!v) && !error;

      updateState(completed, error);
      return !error;
    } else if (!hasData) {
      updateState(true, false);
    }
    return true;
  }

  function getSidebarTopComponent() {
    const locationByType =
      type === RepositoryType.EXTERNAL ? LOCATION.OUT : LOCATION.IN;
    const typeAsString =
      type === RepositoryType.EXTERNAL
        ? 'External Repository'
        : 'Internal Repository';
    return (
      <div className={styles.sidebarComponent}>
        <div className={styles.repoIcon}>
          <RepositoryTypeComponent
            squareLocation={locationByType}
            size={SIZE.SMALL}
            shouldAnimate={false}
          />
          <span className={styles.repoLabel}>{typeAsString}</span>
        </div>
        <p>
          You have selected a repository type.{' '}
          <strong>External repositories</strong> use a version-control system
          located outside the server. <strong>Internal repositories</strong>{' '}
          will be deployed inside the actual Server.
        </p>
      </div>
    );
  }

  return (
    <DefaultPage
      title="Add a Project"
      subtitle="You will create a new KDL project in the actual server. Follow the steps."
      actions={getActions()}
    >
      <>
        <Prompt
          when={isPromptEnabled}
          message="You are going to leave this page. You'll lose your changes, please confirm."
        />
        {type && <SidebarTop>{getSidebarTopComponent()}</SidebarTop>}
        <div className={styles.container}>
          <div className={styles.steps}>
            <div className={styles.stepper}>
              <Stepper
                steps={steps.map((s, idx) => ({
                  id: idx,
                  label: `${s.id.charAt(0).toUpperCase()}${s.id.slice(1)}`,
                  completed: s.completed,
                  error: s.error,
                  active: actStep === idx,
                  visited: actStep >= idx,
                  disabled:
                    idx > actStep + 1 &&
                    (steps[idx - 1]?.error || !steps[idx - 1]?.completed),
                }))}
                activeStep={actStep}
                onStepClick={(stepIndex: number) => {
                  if (actStep > stepIndex || validateStep())
                    goToStep(stepIndex);
                }}
              />
            </div>
          </div>
          <div className={styles.sections}>
            <TransitionGroup className={cx(styles.pages, styles[direction])}>
              <CSSTransition
                key={actStep}
                timeout={200}
                classNames={{
                  enter: styles.enter,
                  exit: styles.exit,
                }}
              >
                {getActStepComponent()}
              </CSSTransition>
            </TransitionGroup>
          </div>
        </div>
      </>
    </DefaultPage>
  );
}

export default NewProject;
