import { CSSTransition, TransitionGroup } from 'react-transition-group';
import React, { useEffect, useMemo, useState } from 'react';
import useStepper, { ActionButton } from 'Hooks/useStepper/useStepper';

import DefaultPage from 'Components/Layout/Page/DefaultPage/DefaultPage';
import Information from './pages/Information/Information';
import ROUTE from 'Constants/routes';
import RepositoryDetails from './pages/RepositoryDetails/RepositoryDetails';
import Stepper from 'Components/Stepper/Stepper';
import Summary from './pages/Summary/Summary';
import cx from 'classnames';
import styles from './NewProject.module.scss';
import { useReactiveVar } from '@apollo/client';
import { Prompt, useHistory } from 'react-router-dom';
import useUnloadPrompt from 'Hooks/useUnloadPrompt/useUnloadPrompt';
import { newProject } from 'Graphql/client/cache';
import SidebarTop from 'Components/Layout/Page/DefaultPage/SidebarTop';
import SidebarInformation from './pages/SidebarComponents/Information/SidebarInformation';
import SidebarExternalRepository from './pages/SidebarComponents/SidebarExternalRepository/SidebarExternalRepository';
import useNewProject from 'Graphql/client/hooks/useNewProject';

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
  SUMMARY = 'summary',
}

const stepperSteps = [
  {
    id: StepNames.INFORMATION,
    Component: Information,
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

function NewProject() {
  const history = useHistory();
  const { clearAll } = useNewProject('information');
  const [isMounted, setIsMounted] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isPromptEnabled, setIsPromptEnabled] = useState(false);

  const { enableUnloadPrompt, disableUnloadPrompt } = useUnloadPrompt();
  const data: { [key in StepNames.INFORMATION | StepNames.DETAILS]?: any } = useReactiveVar(newProject);

  const stepsWithData: (StepNames.INFORMATION | StepNames.DETAILS)[] = useMemo(() => {
    return [StepNames.INFORMATION];
  }, []);

  // We want to execute this on on component mount and unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => disableUnloadPrompt, []);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const routeListener = history.listen((newLocation) => {
      if (newLocation.pathname !== ROUTE.PROJECT_CREATION) clearAll();
    });
    return () => routeListener();
    // We want to execute this on on component mount and unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { direction, goToStep, actStep, getActStepComponent, updateState, nextStep, prevStep, steps } = useStepper({
    data: stepperSteps,
  });

  useEffect(() => {
    const isSomeInputDirty = stepsWithData.some((step) => {
      const stepByIndex = data[step];
      return stepByIndex && Object.values(stepByIndex.values).some((value) => !!value);
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
  }, [isFormDirty, actStep, enableUnloadPrompt, disableUnloadPrompt, setIsPromptEnabled]);

  function getActions() {
    const onNextClick = () => {
      if (validateStep()) nextStep();
    };
    switch (actStep) {
      case 0:
        return [
          <ActionButton key="cancel" label="Cancel" to={ROUTE.HOME} />,
          <ActionButton dataTestId="nextButton" key="next" label="Next" primary onClick={onNextClick} />,
        ];
      case stepperSteps.length - 1:
        return [
          <ActionButton key="key" label="Back" onClick={prevStep} />,
          <ActionButton
            dataTestId="createProjectButton"
            key="create"
            label="Create"
            to={ROUTE.PROJECT_CREATION}
            primary
          />,
        ];
      default:
        return [
          <ActionButton key="back" label="Back" onClick={prevStep} />,
          <ActionButton dataTestId="nextButton" key="next" label="Next" primary onClick={onNextClick} />,
        ];
    }
  }

  // Updates completed and error step states
  function validateStep() {
    const stepData = stepsWithData[actStep];
    const hasData = !!stepData;

    if (hasData && actStep !== Steps.SUMMARY) {
      const actStepData = data[stepData];

      const error = actStepData.errors && Object.values(actStepData.errors).some((e) => e);

      const values = Object.values(actStepData.values).filter((v) => typeof v !== 'boolean');
      const completed = values && values.every((v) => !!v) && !error;

      updateState(completed, error);
      return !error;
    } else if (!hasData) {
      updateState(true, false);
    }
    return true;
  }

  function getSideContent() {
    const step = stepsWithData[actStep];
    switch (step) {
      case StepNames.INFORMATION:
        return <SidebarInformation />;
      case StepNames.DETAILS:
        return <SidebarExternalRepository />;
      default:
        return <></>;
    }
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
        {isMounted && <SidebarTop>{getSideContent()}</SidebarTop>}
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
                  disabled: idx > actStep + 1 && (steps[idx - 1]?.error || !steps[idx - 1]?.completed),
                }))}
                activeStep={actStep}
                onStepClick={(stepIndex: number) => {
                  if (actStep > stepIndex || validateStep()) goToStep(stepIndex);
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
