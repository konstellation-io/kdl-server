import { defaultDataIdFromObject, InMemoryCache, makeVar } from '@apollo/client';
import { ProjectFilters, ProjectOrder, ProjectSelection } from './models/ProjectFilters';
import { UserSelection, UserSettings } from './models/UserSettings';

import { GetProjectMembers_project_members } from '../queries/types/GetProjectMembers';
import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';
import { NewProject } from './models/NewProject';
import { PanelInfo } from './models/Panel';
import { SettingsTab } from './models/SettingsTab';
import { GetRuntimes_runtimes } from '../queries/types/GetRuntimes';
import { GetCapabilities_capabilities } from '../queries/types/GetCapabilities';
import { RepositoryAuthMethod } from '../types/globalTypes';

type ToolName = keyof GetUserTools_project_toolUrls;

export const initialProjectFilters: ProjectFilters = {
  name: '',
  selection: ProjectSelection.ACTIVE,
  order: ProjectOrder.CREATION,
  nFiltered: 0,
};

export const initialNewProject: NewProject = {
  information: {
    values: { name: '', description: '', id: '' },
    errors: {
      id: 'This field is mandatory, please fill it.',
      name: 'This field is mandatory, please fill it.',
      description: 'Please, write a description is important for the project.',
    },
  },
  repository: {
    values: {
      url: '',
      username: '',
      credential: '',
      authMethod: RepositoryAuthMethod.TOKEN,
    },
    errors: {
      url: 'This field is mandatory',
      credential: 'This field is mandatory',
      username: 'This field is mandatory',
      authMethod: RepositoryAuthMethod.TOKEN,
      type: 'Repo type is wrong',
    },
    // errors: { type: 'Please choose a repo type' },
  },
  // externalRepository: {
  //   values: {
  //     url: '',
  //     username: '',
  //     credential: '',
  //     authMethod: RepositoryAuthMethod.TOKEN,
  //   },
  //   errors: {
  //     url: 'This field is mandatory',
  //     credential: 'This field is mandatory',
  //     username: 'This field is mandatory',
  //     authMethod: 'This field is mandatory',
  //   },
  // },
};

const initialStateUserSettings: UserSettings = {
  selectedUserIds: [],
  userSelection: UserSelection.NONE,
  filters: {
    email: null,
    accessLevel: null,
  },
};

export const projectFilters = makeVar(initialProjectFilters);
export const newProject = makeVar(initialNewProject);
export const openedProject = makeVar<GetProjects_projects | null>(null);
export const userSettings = makeVar<UserSettings>(initialStateUserSettings);
export const memberDetails = makeVar<GetProjectMembers_project_members | null>(null);
export const primaryPanel = makeVar<PanelInfo | null>(null);
export const secondaryPanel = makeVar<PanelInfo | null>(null);
export const currentTool = makeVar<ToolName | null>(null);
export const openedTools = makeVar<ToolName[]>([]);
export const openedSettingTab = makeVar<SettingsTab>(SettingsTab.INFO);
// the last ran runtime
export const lastRanRuntime = makeVar<GetRuntimes_runtimes | null>(null);
// the actual running runtime
export const runningRuntime = makeVar<GetRuntimes_runtimes | null>(null);
export const loadingRuntime = makeVar<string | null>(null);
export const selectedCapabilities = makeVar<GetCapabilities_capabilities | null>(null);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        projectFilters: { read: () => projectFilters() },
        newProject: { read: () => newProject() },
        openedProject: { read: () => openedProject() },
        userSettings: { read: () => userSettings() },
        primaryPanel: { read: () => primaryPanel() },
        secondaryPanel: { read: () => secondaryPanel() },
        projects: { merge: false },
        apiTokens: { merge: false },
        users: { merge: false },
      },
    },
    User: {
      fields: {
        apiTokens: { merge: false },
      },
    },
    Project: {
      fields: {
        members: { merge: false },
      },
    },
  },
  dataIdFromObject(responseObj) {
    return defaultDataIdFromObject(responseObj);
  },
});

export default cache;
