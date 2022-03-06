import ReactTooltip from 'react-tooltip';
import styles from './NavElements.module.scss';
import * as React from 'react';

type Props = {
  cssId: string;
  spanText: string;
  children: JSX.Element;
};

const TooltipElement: React.FC<Props> = ({ cssId, spanText, children }: Props) => {
  return (
    <div>
      <ReactTooltip id={cssId} effect="solid" textColor="white" backgroundColor="#888" className={styles.toolsTip}>
        <span>{spanText}</span>
      </ReactTooltip>
      <div data-tip data-for={cssId}>
        {children}
      </div>
    </div>
  );
};

export default TooltipElement;
