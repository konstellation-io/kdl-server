import React, { useState } from 'react';

import AnimateHeight from 'react-animate-height';
import IconHelp from '@material-ui/icons/Help';
import MessageActionBox, {
  BoxActionProps,
} from 'Components/MessageActionBox/MessageActionBox';
import cx from 'classnames';
import styles from './FAQBox.module.scss';

const SIZE_CLOSED = 42;

export enum BOX_THEME {
  DEFAULT = 'default',
  WARN = 'warn',
  ERROR = 'error',
}

type Props = {
  label: string;
  title: string;
  description: string;
  action?: BoxActionProps;
  customAction?: JSX.Element;
  theme?: BOX_THEME;
};
function FAQBox({
  label,
  title,
  description,
  action,
  customAction,
  theme = BOX_THEME.DEFAULT,
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
      <div className={styles.actionBox}>
        <MessageActionBox
          title={title}
          description={description}
          action={action}
          customAction={customAction}
          theme={theme}
        />
      </div>
    </AnimateHeight>
  );
}

export default FAQBox;
