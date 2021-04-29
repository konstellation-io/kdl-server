import { member1, member2 } from './member';

const toolUrls = {
  drone: 'drone',
  gitea: 'drone',
  jupyter: 'gitea',
  minio: 'jupyter',
  mlflow: 'minio',
  vscode: 'mlflow',
};

export const project1 = {
  id: 'projectId1',
  name: 'projectName1',
  description: 'projectDescription1',
  favorite: false,
  creationDate: '2020-02-02',
  lastActivationDate: '2020-02-02',
  repository: null,
  needAccess: false,
  archived: false,
  error: null,
  toolUrls,
  members: [member1, member2],
};
