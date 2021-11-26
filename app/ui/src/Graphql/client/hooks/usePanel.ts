import { PANEL_ID, PanelInfo } from '../models/Panel';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import { primaryPanel, secondaryPanel } from '../cache';

import { useReactiveVar } from '@apollo/client';

export enum PanelType {
  PRIMARY,
  SECONDARY,
}

type UsePanelOptions = {
  id: PANEL_ID;
  title: string;
  isDark?: boolean | null;
  size?: PANEL_SIZE;
  theme?: PANEL_THEME;
  fixedWidth?: boolean | null;
};
function usePanel(
  type: PanelType,
  options: UsePanelOptions = {
    id: PANEL_ID.SETTINGS,
    title: '',
    theme: PANEL_THEME.DEFAULT,
    fixedWidth: null,
  },
) {
  const primaryPanelData = useReactiveVar(primaryPanel);
  const secondaryPanelData = useReactiveVar(secondaryPanel);

  const panel = type === PanelType.PRIMARY ? primaryPanel : secondaryPanel;
  const data = type === PanelType.PRIMARY ? primaryPanelData : secondaryPanelData;
  // null value in graphql is "null" not "undefined", we need to make sure we use "null"
  const panelProps: PanelInfo = {
    isDark: null,
    fixedWidth: null,
    size: PANEL_SIZE.DEFAULT,
    theme: PANEL_THEME.DEFAULT,
    ...options,
  };

  const openPanel = () => panel(panelProps);
  const closePanel = () => {
    panel(null);

    // Closing a primary panel also closes any secondary panel
    if (type === PanelType.PRIMARY) secondaryPanel(null);
  };
  const togglePanel = data !== null ? closePanel : openPanel;

  return {
    openPanel,
    closePanel,
    togglePanel,
  };
}

export default usePanel;
