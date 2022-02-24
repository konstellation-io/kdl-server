import { apiToken1 } from './apiToken';
import { AccessLevel } from '../../Graphql/types/globalTypes';

export const userMe = {
  id: 'userMe',
  email: 'admin@konstellation.io',
  username: 'userMe',
  creationDate: '2020-02-01',
  lastActivity: '2020-02-01',
  accessLevel: AccessLevel.ADMIN,
  apiTokens: [apiToken1],
  isKubeconfigEnabled: true,
};

export const user1 = {
  id: 'userId1',
  email: 'userEmail1',
  username: 'username1',
  creationDate: '2020-02-02',
  lastActivity: '2020-02-02',
  accessLevel: AccessLevel.VIEWER,
};

export const user2 = {
  id: 'userId2',
  email: 'userEmail2',
  username: 'username2',
  creationDate: '2020-02-03',
  lastActivity: '2020-02-03',
  accessLevel: AccessLevel.VIEWER,
};

export const newUser = {
  id: 'userId3',
  email: 'userEmail3',
  username: 'username3',
  creationDate: '2020-02-04',
  lastActivity: '2020-02-04',
  accessLevel: AccessLevel.VIEWER,
};

export const users = [userMe, user1, user2];
