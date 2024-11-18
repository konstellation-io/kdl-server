import { memberMe, member1, member2 } from './member';
import { RepositoryType } from '../../Graphql/types/globalTypes';

const toolUrls = {
  knowledgeGalaxy: 'https://knowledgeGalaxy',
  gitea: 'https://gitea',
  filebrowser: 'https://filebrowser',
  mlflow: 'https://mlflow',
  vscode: 'https://vscode',
};

export const project1 = {
  id: 'projectId1',
  name: 'projectName1',
  description: 'projectDescription1',
  favorite: false,
  creationDate: '2020-02-02',
  lastActivationDate: '2020-02-02',
  repository: {
    type: RepositoryType.EXTERNAL,
    url: 'https://my-super-url.com',
    error: false,
  },
  needAccess: false,
  archived: false,
  error: null,
  toolUrls,
  members: [memberMe, member1, member2],
  __typename: 'Project',
};

export const project2 = {
  id: 'projectId2',
  name: 'projectName2',
  description: 'projectDescription2',
  favorite: true,
  creationDate: '2020-03-03',
  lastActivationDate: '2020-03-03',
  repository: null,
  needAccess: false,
  archived: false,
  error: null,
  toolUrls,
  members: [member1, member2],
  __typename: 'Project',
};

export const projectNoAccess = {
  id: 'projectId3',
  name: 'projectName3',
  description: 'projectDescription3',
  favorite: false,
  creationDate: '2020-02-02',
  lastActivationDate: '2020-02-02',
  repository: null,
  needAccess: true,
  archived: false,
  error: null,
  toolUrls,
  members: [member1, member2],
  __typename: 'Project',
};

export const projectArchived = {
  id: 'projectId4',
  name: 'projectName4',
  description: 'projectDescription4',
  favorite: true,
  creationDate: '2020-03-03',
  lastActivationDate: '2020-03-03',
  repository: null,
  needAccess: false,
  archived: true,
  error: null,
  toolUrls,
  members: [member1, member2],
  __typename: 'Project',
};
