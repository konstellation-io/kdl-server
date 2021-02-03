import { PANEL_SIZE } from 'Components/Layout/Panel/Panel';

export type PanelInfo = {
  id: PANEL_ID;
  title: string;
  fixedWidth: boolean | null;
  isDark: boolean | null;
  size: PANEL_SIZE;
};

export enum PANEL_ID {
  SETTINGS = 'settings',
  REPOSITORY_INFO = 'repositoryInfo',
  MEMBER_INFO = 'memberInfo',
  KG_RESULTS = 'kgResults',
}
