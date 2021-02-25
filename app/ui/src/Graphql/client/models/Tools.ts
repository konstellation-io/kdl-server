import { GetUserTools_project_toolUrls } from '../../queries/types/GetUserTools';

export interface Tools {
  currentTool: keyof GetUserTools_project_toolUrls | null;
  openedTools: (keyof GetUserTools_project_toolUrls)[];
}
