import React, {FunctionComponent, MouseEvent} from 'react';
import styles from './Server.module.scss';
import { useHistory } from 'react-router-dom';
import {SvgIconProps} from "@material-ui/core/SvgIcon";

type Action = {
  label: string;
  Icon: FunctionComponent<SvgIconProps>;
  onClick?: Function;
  to?: string;
};
function ActionButton({ label, Icon, onClick, to }: Action) {
  const history = useHistory();

  function handleOnClick(event?: MouseEvent<HTMLDivElement>) {
    event?.stopPropagation();
    event?.preventDefault();

    if (onClick) onClick();
    else if (to) history.push(to || '');
  }

  return (
    <div className={styles.actionButtonContainer}>
      <div onClick={handleOnClick} className={styles.actionButtonBg} />
      <div className={styles.actionButtonContent}>
        <Icon className={'icon-regular'} />
        <p className={styles.actionButtonLabel}>{label}</p>
      </div>
    </div>
  );
}

export default ActionButton;
