import {
  GET_SECONDARY_PANEL,
  GetSecondaryPanel,
} from 'Graphql/client/queries/getSecondaryPanel.graphql';
import { PANEL_ID, PanelInfo } from '../models/Panel';
import { primaryPanel, secondaryPanel } from '../cache';

import { GET_PRIMARY_PANEL } from 'Graphql/client/queries/getPrimaryPanel.graphql';
import { GetPrimaryPanel } from 'Graphql/client/queries/getPrimaryPanel.graphql';
import { PANEL_SIZE } from 'Components/Layout/Panel/Panel';
import { useQuery } from '@apollo/client';

export enum PanelType {
  PRIMARY,
  SECONDARY,
}

type UsePanelOptions = {
  id: PANEL_ID;
  title: string;
  isDark?: boolean | null;
  size?: PANEL_SIZE;
  fixedWidth?: boolean | null;
};
function usePanel(
  type: PanelType,
  options: UsePanelOptions = {
    id: PANEL_ID.SETTINGS,
    title: '',
    isDark: null,
    fixedWidth: null,
  }
) {
  const { data: primaryPanelData } = useQuery<GetPrimaryPanel>(
    GET_PRIMARY_PANEL
  );
  const { data: secondaryPanelData } = useQuery<GetSecondaryPanel>(
    GET_SECONDARY_PANEL
  );

  const panel = type === PanelType.PRIMARY ? primaryPanel : secondaryPanel;
  const data =
    type === PanelType.PRIMARY
      ? primaryPanelData?.primaryPanel
      : secondaryPanelData?.secondaryPanel;
  // null value in graphql is "null" not "undefined", we need to make sure we use "null"
  const panelProps: PanelInfo = {
    isDark: null,
    fixedWidth: null,
    size: PANEL_SIZE.DEFAULT,
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
