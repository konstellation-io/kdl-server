import ReactTooltip, { Effect, Place, Type } from 'react-tooltip';
import styles from './Tooltip.module.scss';
import * as React from 'react';

type Props = {
  spanText: string;
  tooltipId: string;
  tooltipProps: {
    type?: string;
    effect?: string;
    textColor: string;
    backgroundColor: string;
    place?: string;
  };
  children: JSX.Element;
};

const Tooltip: React.FC<Props> = ({ tooltipId, spanText, tooltipProps, children }: Props) => {
  const { type, effect, textColor, backgroundColor, place } = tooltipProps;
  return (
    <div>
      <ReactTooltip
        id={tooltipId}
        type={type as Type}
        effect={effect as Effect}
        textColor={textColor}
        backgroundColor={backgroundColor}
        place={place as Place}
        className={styles.toolsTip}
      >
        <span>{spanText}</span>
      </ReactTooltip>
      <div data-tip data-for={tooltipId}>
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
