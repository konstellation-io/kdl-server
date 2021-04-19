import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './Crumb.module.scss';
import AnimateHeight from 'react-animate-height';
import { useClickOutside } from 'kwc';
import cx from 'classnames';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  const [showComponent, setShowComponent] = useState(false);
  const hideComponent = () => setShowComponent(false);

  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: crumbRef,
    action: hideComponent,
  });

  useEffect(() => {
    if (crumbRef && showComponent) addClickOutsideEvents();
    else removeClickOutsideEvents();
  }, [showComponent, addClickOutsideEvents, removeClickOutsideEvents]);

  return (
    <div className={styles.container} ref={crumbRef}>
      <div
        onClick={() => setShowComponent(!showComponent)}
        className={styles.crumbContainer}
      >
        {LeftIconComponent}
        <span className={styles.crumbText}>{crumbText}</span>
        <ExpandMoreIcon
          className={cx(styles.rightIcon, 'icon-regular', {
            [styles.opened]: showComponent,
          })}
        />
      </div>
      <AnimateHeight
        height={showComponent ? 'auto' : 0}
        duration={300}
        className={styles.content}
      >
        <BottomComponent closeComponent={hideComponent} />
      </AnimateHeight>
    </div>
  );
}

export default Crumb;
