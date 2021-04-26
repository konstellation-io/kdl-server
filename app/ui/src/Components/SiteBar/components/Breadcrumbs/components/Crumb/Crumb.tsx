import React, { FC, useEffect, useRef } from 'react';
import styles from './Crumb.module.scss';
import AnimateHeight from 'react-animate-height';
import { useClickOutside } from 'kwc';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import useBoolState from 'Hooks/useBoolState';

export interface BottomComponentProps {
  closeComponent: () => void;
}
export type CrumbProps = {
  crumbText: string;
  LeftIconComponent: React.ReactElement;
  BottomComponent: FC<BottomComponentProps>;
};

function Crumb({ crumbText, LeftIconComponent, BottomComponent }: CrumbProps) {
  const crumbRef = useRef(null);
  const {
    value: opened,
    toggle: toggleComponent,
    deactivate: hideComponent,
  } = useBoolState(false);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: crumbRef,
    action: hideComponent,
  });

  useEffect(() => {
    if (crumbRef && opened) addClickOutsideEvents();
    else removeClickOutsideEvents();
  }, [opened, addClickOutsideEvents, removeClickOutsideEvents]);

  return (
    <div className={styles.container} onClick={toggleComponent} ref={crumbRef}>
      <div className={styles.crumbContainer}>
        {LeftIconComponent}
        <span className={styles.crumbText}>{crumbText}</span>
        <ExpandMoreIcon
          className={cx(styles.rightIcon, 'icon-regular', {
            [styles.opened]: opened,
          })}
        />
      </div>
      <AnimateHeight
        height={opened ? 'auto' : 0}
        duration={300}
        className={styles.content}
      >
        <BottomComponent closeComponent={hideComponent} />
      </AnimateHeight>
    </div>
  );
}

export default Crumb;
