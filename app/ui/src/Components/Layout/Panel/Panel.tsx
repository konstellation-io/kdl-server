import { CSSTransition, TransitionGroup } from 'react-transition-group';
import React, { FC, memo } from 'react';

import { Button } from 'kwc';
import IconClose from '@material-ui/icons/Close';
import cx from 'classnames';
import styles from './Panel.module.scss';

export enum PANEL_THEME {
  DEFAULT = 'themeDefault',
  DARK = 'themeDark',
  LIGHT = 'themeLight',
}

export enum PANEL_SIZE {
  DEFAULT = 'default',
  BIG = 'big',
}

type Props = {
  title?: string;
  show: boolean;
  close: () => void;
  extraButton?: JSX.Element | null;
  children?: JSX.Element | null | false;
  size?: PANEL_SIZE;
  noShrink?: boolean;
  theme?: PANEL_THEME;
};
const Panel: FC<Props> = ({
  show,
  close,
  extraButton,
  children,
  title = '',
  size = PANEL_SIZE.DEFAULT,
  noShrink = false,
  theme = PANEL_THEME.DEFAULT,
}) => (
  <TransitionGroup
    className={cx(styles.group, styles[size], {
      [styles.noShrink]: noShrink,
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
          <div className={cx(styles.container, styles[size], styles[theme])}>
            {title !== '' && (
              <header>
                <div className={styles.separator} />
                <p className={styles.title}>{title}</p>
                {extraButton}
                <Button label="" Icon={IconClose} onClick={close} />
              </header>
            )}
            <div className={styles.content}>{children}</div>
          </div>
        )}
      </>
    </CSSTransition>
  </TransitionGroup>
);

export default memo(Panel);
