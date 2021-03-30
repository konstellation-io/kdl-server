import { BUTTON_THEMES, Button, Check } from 'kwc';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { OverrideProps } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';
import cx from 'classnames';
import styles from './MessageActionBox.module.scss';

export enum BOX_THEME {
  DEFAULT = 'default',
  WARN = 'warn',
  ERROR = 'error',
}

const toButtonTheme = new Map([
  [BOX_THEME.DEFAULT, BUTTON_THEMES.DEFAULT],
  [BOX_THEME.WARN, BUTTON_THEMES.WARN],
  [BOX_THEME.ERROR, BUTTON_THEMES.ERROR],
]);

export type BoxAction = {
  needConfirmation?: boolean;
  message?: string;
  label: string;
  onClick: () => void;
  Icon?: FunctionComponent<OverrideProps<SvgIconTypeMap<{}, 'svg'>, 'svg'>>;
  loading?: boolean;
};

type Props = {
  title: string;
  description: string;
  action?: BoxAction;
  theme?: BOX_THEME;
  customAction?: JSX.Element;
};

function MessageActionBox({
  title,
  description,
  action,
  customAction,
  theme = BOX_THEME.DEFAULT,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (action?.loading) {
      setConfirmed(false);
    }
  }, [action?.loading]);

  function getAction() {
    if (customAction) return customAction;

    if (action) {
      return (
        <div className={styles.action}>
          {action.needConfirmation && (
            <div className={styles.confirmation}>
              <Check checked={confirmed} onChange={(v) => setConfirmed(v)} />
              <p className={styles.confirmationText}>{action.message}</p>
            </div>
          )}
          <div className={styles.button}>
            <Button
              label={action.label}
              theme={toButtonTheme.get(theme)}
              onClick={action.onClick}
              disabled={
                (action.needConfirmation && !confirmed) || action.loading
              }
              loading={action.loading}
              height={30}
              Icon={action.Icon}
              primary
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={cx(styles.container, styles[theme])}
      onClick={(e) => e.stopPropagation()}
    >
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {getAction()}
    </div>
  );
}

export default MessageActionBox;
