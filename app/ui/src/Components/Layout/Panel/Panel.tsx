import { CSSTransition, TransitionGroup } from 'react-transition-group';
import React, { FC, memo } from 'react';

import { Button } from 'kwc';
import IconClose from '@material-ui/icons/Close';
import cx from 'classnames';
import styles from './Panel.module.scss';

export enum PANEL_SIZE {
  DEFAULT = 'default',
  BIG = 'big',
}

type Props = {
  title: string;
  show: boolean;
  close: () => void;
  children?: JSX.Element | null | false;
  size?: PANEL_SIZE;
  noShrink?: boolean;
  dark?: boolean;
};
const Panel: FC<Props> = ({
  show,
  close,
  children,
  title = '',
  size = PANEL_SIZE.DEFAULT,
  noShrink = false,
  dark = false,
}) => (
  <TransitionGroup
    className={cx(styles.group, styles[size], {
      [styles.noShrink]: noShrink,
      [styles.dark]: dark,
    })}
  >
    <CSSTransition
      key={`${show}`}
      timeout={500}
      classNames={{
        enter: styles.enter,
        exit: styles.exit,
      }}
    >
      <>
        {show && (
          <div className={cx(styles.container, styles[size])}>
            <header>
              <div className={styles.separator} />
              <p className={styles.title}>{title}</p>
              <Button label="" Icon={IconClose} onClick={close} />
            </header>
            <div className={styles.content}>{children}</div>
          </div>
        )}
      </>
    </CSSTransition>
  </TransitionGroup>
);

export default memo(Panel);
