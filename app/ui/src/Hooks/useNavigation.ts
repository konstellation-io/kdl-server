import { useRef, useState } from 'react';

enum Direction {
  NEXT = 'next',
  PREV = 'prev',
}

type UseNavigationParams = {
  initialStep?: number;
  beforeGoToStep?: () => void;
  maxSteps: number;
  loop?: boolean;
};
function useNavigation({
  initialStep = 0,
  beforeGoToStep = () => {},
  loop = true,
  maxSteps,
}: UseNavigationParams) {
  const [actStep, setActStep] = useState(initialStep);
  const direction = useRef(Direction.NEXT);

  function nextStep() {
    if (actStep === maxSteps - 1) {
      if (loop) {
        goToStep(0);
        direction.current = Direction.NEXT;
      }
    } else {
      goToStep(actStep + 1);
    }
  }

  function prevStep() {
    if (actStep === 0) {
      if (loop) {
        goToStep(maxSteps - 1);
        direction.current = Direction.PREV;
      }
    } else {
      goToStep(actStep - 1);
    }
  }

  function goToStep(newStep: number) {
    beforeGoToStep();

    direction.current = newStep > actStep ? Direction.NEXT : Direction.PREV;
    setActStep(newStep);
  }

  return {
    actStep,
    goToStep,
    nextStep,
    prevStep,
    direction: direction.current as string,
  };
}

export default useNavigation;
