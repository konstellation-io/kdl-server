import { Lottie } from 'kwc';
import React from 'react';
import animationData from './animation.json';
import cx from 'classnames';
import styles from './StatusCircle.module.scss';

export enum States {
  INITIALIZING = 'INITIALIZING',
  LOADING = 'LOADING',
  DISABLED = 'DISABLED',
  ERROR = 'ERROR',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
}

type Timestamps = [number, number];

const ANIM_SEGMENTS = new Map<States, Timestamps>([
  [States.INITIALIZING, [0, 119]],
  [States.LOADING, [120, 399]],
  [States.DISABLED, [400, 799]],
  [States.ERROR, [800, 1199]],
  [States.ALERT, [1200, 1599]],
  [States.SUCCESS, [1600, 1999]],
]);

type Props = {
  animation?: States;
  label?: string;
  size?: number;
};

function StatusCircle({
  animation = States.INITIALIZING,
  label = 'LOADING...',
  size = 250,
}: Props = {}) {
  const animationSegments = [ANIM_SEGMENTS.get(animation) as Timestamps];

  // Adds loading animation after finishing initiallization animation.
  if (animation === States.INITIALIZING) {
    animationSegments.push(ANIM_SEGMENTS.get(States.LOADING) as Timestamps);
  }

  return (
    <div
      className={styles.loaderContainer}
      style={{ width: size, height: size }}
    >
      <Lottie
        options={{ animationData }}
        width={size}
        height={size}
        segments={animationSegments}
        forceSegments
      />
      <div
        className={cx(styles.innerContainer, {
          [styles.initializing]: animation === States.INITIALIZING,
        })}
      >
        {label}
      </div>
    </div>
  );
}

export default StatusCircle;
