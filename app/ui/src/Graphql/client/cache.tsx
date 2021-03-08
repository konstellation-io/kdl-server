import { InMemoryCache, makeVar } from '@apollo/client';
import {
  ProjectFilters,
  ProjectOrder,
  ProjectSelection,
} from './models/ProjectFilters';
import { UserSelection, UserSettings } from './models/UserSettings';

import { GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';
import { NewProject } from './models/NewProject';
import { PanelInfo } from './models/Panel';
import { GetProjectMembers_project_members } from '../queries/types/GetProjectMembers';

export const initialProjectFilters: ProjectFilters = {
  name: '',
  selection: ProjectSelection.ACTIVE,
  order: ProjectOrder.AZ,
  nFiltered: 0,
};

export const initialNewProject: NewProject = {
  information: {
    values: { name: '', description: '' },
    errors: {
      name: 'This field is mandatory, please fill it.',
      description: 'Please, write a description is important for the project.',
    },
  },
  repository: {
    values: {
      type: null,
    },
    errors: { type: 'Please choose a repo type' },
  },
  externalRepository: {
    values: {
      url: '',
      isConnectionTested: false,
      hasConnectionError: '',
      warning: false,
    },
    errors: {
      url: '',
      warning: 'not accepted',
    },
  },
  internalRepository: {
    values: { slug: '', url: '' },
    errors: { slug: '' },
  },
};

const initialStateUserSettings: UserSettings = {
  selectedUserIds: [],
  userSelection: UserSelection.NONE,
  filters: {
    email: null,
    accessLevel: null,
  },
};

type ToolName = keyof GetUserTools_project_toolUrls;

export const projectFilters = makeVar(initialProjectFilters);
export const newProject = makeVar(initialNewProject);
export const openedProject = makeVar<GetProjects_projects | null>(null);
export const userSettings = makeVar<UserSettings>(initialStateUserSettings);
export const memberDetails = makeVar<GetProjectMembers_project_members | null>(
  null
);
export const primaryPanel = makeVar<PanelInfo | null>(null);
export const secondaryPanel = makeVar<PanelInfo | null>(null);
export const currentTool = makeVar<ToolName | null>(null);
export const openedTools = makeVar<ToolName[]>([]);

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
        memberDetails: { read: () => memberDetails() },
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
  },
});

export default cache;
