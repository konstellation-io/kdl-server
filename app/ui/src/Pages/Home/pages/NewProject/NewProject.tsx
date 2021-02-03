import { CSSTransition, TransitionGroup } from 'react-transition-group';
import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';
import ROUTE, { RouteServerParams, buildRoute } from 'Constants/routes';
import React, { useEffect } from 'react';
import RepositoryTypeComponent, {
  LOCATION,
  SIZE,
} from './pages/Repository/components/RepositoryTypeComponent/RepositoryTypeComponent';
import useStepper, { ActionButton } from 'Hooks/useStepper/useStepper';

import DefaultPage from 'Components/Layout/Page/DefaultPage/DefaultPage';
import Information from './pages/Information/Information';
import Repository from './pages/Repository/Repository';
import RepositoryDetails from './pages/RepositoryDetails/RepositoryDetails';
import { RepositoryType } from 'Graphql/types/globalTypes';
import SidebarTop from 'Components/Layout/Page/DefaultPage/SidebarTop';
import { SpinnerCircular } from 'kwc';
import Stepper from 'Components/Stepper/Stepper';
import Summary from './pages/Summary/Summary';
import cx from 'classnames';
import styles from './NewProject.module.scss';
import useNewProject from '../../apollo/hooks/useNewProject';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

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
  [k: string]: StepNames.EXTERNAL | StepNames.INTERNAL;
} = {
  [RepositoryType.EXTERNAL]: StepNames.EXTERNAL,
  [RepositoryType.INTERNAL]: StepNames.INTERNAL,
};

function NewProject() {
  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);

  const { serverId } = useParams<RouteServerParams>();
  const { clearAll } = useNewProject('information');
  const cancelRoute = buildRoute.server(ROUTE.HOME, serverId);
  const type = data?.newProject.repository.values.type || null;

  const stepsWithData: (
    | StepNames.INFORMATION
    | StepNames.REPOSITORY
    | StepNames.INTERNAL
    | StepNames.EXTERNAL
  )[] = [
    StepNames.INFORMATION,
    StepNames.REPOSITORY,
    repoTypeToStepName[type || ''],
  ];

  // We want to execute this on on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => clearAll(), []);

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
    updateState(false, true, Steps.REPOSITORY_DETAILS);
    // We only want to update state also when type changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function getActions() {
    const onNextClick = () => {
      if (validateStep()) nextStep();
    };
    switch (actStep) {
      case 0:
        return [
          <ActionButton key="cancel" label="CANCEL" to={cancelRoute} />,
          <ActionButton
            key="next"
            label="NEXT"
            primary
            onClick={onNextClick}
          />,
        ];
      case stepperSteps.length - 1:
        return [
          <ActionButton key="key" label="BACK" onClick={prevStep} />,
          <ActionButton
            key="create"
            label="CREATE"
            to={buildRoute.server(ROUTE.CREATION_PROJECT, serverId)}
            primary
          />,
        ];
      default:
        return [
          <ActionButton key="back" label="BACK" onClick={prevStep} />,
          <ActionButton
            key="next"
            label="NEXT"
            primary
            disabled={isNextDisabled()}
            onClick={onNextClick}
          />,
        ];
    }
  }

  function isNextDisabled() {
    if (
      data &&
      data.newProject.externalRepository &&
      actStep === Steps.REPOSITORY_DETAILS &&
      type === RepositoryType.EXTERNAL
    ) {
      const {
        errors: { warning },
      } = data.newProject.externalRepository;

      return warning !== '';
    }
    return false;
  }

  if (!data) return <SpinnerCircular />;

  // Updates completed and error step states
  function validateStep() {
    const stepData = stepsWithData[actStep];
    if (data && stepData !== null && actStep !== Steps.SUMMARY) {
      // @ts-ignore
      const actStepData = data.newProject[stepData];

      const error =
        actStepData.errors && Object.values(actStepData.errors).some((e) => e);

      const values = Object.values(actStepData.values).filter(
        (v) => typeof v !== 'boolean'
      );
      const completed = values && values.every((v) => !!v) && !error;

      updateState(completed, error);
      return !error;
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
