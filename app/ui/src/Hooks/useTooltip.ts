import { useState } from 'react';

export type TooltipInfo<T> = {
  top: number;
  left: number;
  open: boolean;
  data?: T;
};

export type UpdateTooltip<T> = {
  top?: number;
  left?: number;
  open?: boolean;
  data?: T;
};

const defaultValues = {
  top: 0,
  left: 0,
  open: false,
  data: undefined,
};

export function useTooltip<TooltipData>() {
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo<TooltipData>>(
    defaultValues
  );

  function updateTooltip(newValues: UpdateTooltip<TooltipData>) {
    setTooltipInfo((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  }

  function hideTooltip() {
    updateTooltip({ open: false });
  }

  return {
    tooltipInfo,
    updateTooltip,
    hideTooltip,
  };
}
export default useTooltip;
