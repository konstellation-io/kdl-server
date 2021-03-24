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

type Action = {
  needConfirmation?: boolean;
  message?: string;
  label: string;
  onClick: () => void;
  Icon?: FunctionComponent<OverrideProps<SvgIconTypeMap<{}, 'svg'>, 'svg'>>;
};

type Props = {
  title: string;
  desciption: string;
  action?: Action;
  theme?: BOX_THEME;
  loading?: boolean;
};
function MessageActionBox({
  title,
  desciption,
  action,
  theme = BOX_THEME.DEFAULT,
  loading = false,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (loading) {
      setConfirmed(false);
    }
  }, [loading]);

  return (
    <div
      className={cx(styles.container, styles[theme])}
      onClick={(e) => e.stopPropagation()}
    >
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{desciption}</p>
      {action && (
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
              disabled={action.needConfirmation && !confirmed}
              loading={loading}
              height={30}
              Icon={action.Icon}
              primary
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageActionBox;
