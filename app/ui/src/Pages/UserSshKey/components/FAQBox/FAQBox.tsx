import React, { useState } from 'react';

import AnimateHeight from 'react-animate-height';
import IconHelp from '@material-ui/icons/Help';
import MessageActionBox from 'Components/MessageActionBox/MessageActionBox';
import cx from 'classnames';
import styles from './FAQBox.module.scss';

const SIZE_CLOSED = 42;

export enum BOX_THEME {
  DEFAULT = 'default',
  WARN = 'warn',
  ERROR = 'error',
}

type Action = {
  needConfirmation?: boolean;
  message?: string;
  label: string;
  onClick: () => void;
};

type Props = {
  label: string;
  title: string;
  desciption: string;
  action?: Action;
  customAction?: JSX.Element;
  theme?: BOX_THEME;
  loading?: boolean;
};
function FAQBox({
                  label,
                  title,
                  desciption,
                  action,
                  customAction,
                  theme = BOX_THEME.DEFAULT,
                  loading = false,
                }: Props) {
  const [opened, setOpened] = useState(false);

  function toggleOpened() {
    setOpened(!opened);
  }

  return (
    <AnimateHeight
      duration={300}
      height={opened ? 'auto' : SIZE_CLOSED}
      className={cx(styles.container, { [styles.opened]: opened })}
      onClick={toggleOpened}
    >
      <div className={styles.header}>
        <IconHelp className="icon-small" />
        <p className={styles.label}>{label}</p>
      </div>
      <MessageActionBox
        title={title}
        desciption={desciption}
        action={action}
        customAction={customAction}
        theme={theme}
        loading={loading}
      />
    </AnimateHeight>
  );
}

export default FAQBox;
