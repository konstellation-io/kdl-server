import ReactTooltip, { Effect, Place, Type } from 'react-tooltip';
import styles from './Tooltip.module.scss';
import * as React from 'react';

type Props = {
  spanText: string;
  cssId: string;
  tooltipProps: {
    type?: string;
    effect?: string;
    textColor: string;
    backgroundColor: string;
    place?: string;
  };
  children: JSX.Element;
};

const Tooltip: React.FC<Props> = ({ spanText, cssId, tooltipProps, children }: Props) => {
  const { type, effect, textColor, backgroundColor, place } = tooltipProps;
  return (
    <div>
      <ReactTooltip
        id={cssId}
        type={type as Type}
        effect={effect as Effect}
        textColor={textColor}
        backgroundColor={backgroundColor}
        place={place as Place}
        className={styles.toolsTip}
      >
        <span>{spanText}</span>
      </ReactTooltip>
      <div data-tip data-for={cssId}>
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
