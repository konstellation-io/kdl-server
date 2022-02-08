import React, { useState } from 'react';
import styles from './Tooltip.module.scss';

type Props = {
  content: string;
  children: JSX.Element;
  delay?: number;
  direction?: string;
};

const Tooltip = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timeout: any;
  const [active, setActive] = useState(false);

  const showTip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, props.delay || 400);
  };

  const hideTip = () => {
    clearInterval(timeout);
    setActive(false);
  };

  return (
    <div
      className={styles.TooltipWrapper}
      // When to show the tooltip
      onMouseEnter={showTip}
      // onMouseLeave={hideTip}
    >
      {/* Wrapping */}
      {props.children}
      {active && (
        <div className={`${styles.Tooltip} ${props.direction || 'top'}`}>
          {/* Content */}
          {props.content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
