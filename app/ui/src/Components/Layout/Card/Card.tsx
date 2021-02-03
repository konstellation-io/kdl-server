import React, { FC } from 'react';

import cx from 'classnames';
import styles from './Card.module.scss';

export enum CardState {
  OK = 'ok',
  ALERT = 'alert',
}

type Props = {
  state?: CardState;
  children: JSX.Element | JSX.Element[];
};
const Card: FC<Props> = ({ state = CardState.OK, children }: Props) => (
  <div className={cx(styles.container, styles[state])}>{children}</div>
);

export default Card;
