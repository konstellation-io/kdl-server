import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';

export type PanelInfo = {
  id: PANEL_ID;
  title: string;
  fixedWidth: boolean | null;
  theme: PANEL_THEME;
  size: PANEL_SIZE;
};

export enum PANEL_ID {
  SETTINGS = 'settings',
  PROJECT_DESCRIPTION = 'projectDescription',
  MEMBER_INFO = 'memberInfo',
  RUNTIMES_LIST = 'runtimesList',
  RUNTIME_INFO = 'runtimeInfo',
}
