import { useState } from 'react';

export type TextTooltipInfo = {
  top: number;
  left: number;
  text: string;
  open: boolean;
};

export type UpdateTooltip = {
  top?: number;
  left?: number;
  text?: string;
  open?: boolean;
};

const defaultValues: TextTooltipInfo = {
  top: 0,
  left: 0,
  text: '',
  open: false,
};

export function useTextTooltip() {
  const [tooltipInfo, setTooltipInfo] = useState<TextTooltipInfo>(
    defaultValues
  );

  function updateTooltip(newValues: UpdateTooltip) {
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
export default useTextTooltip;
