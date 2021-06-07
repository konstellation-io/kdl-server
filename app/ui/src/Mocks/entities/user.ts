import { apiToken1 } from './apiToken';
import { AccessLevel } from '../../Graphql/types/globalTypes';

export const userMe = {
  id: 'userMe',
  email: 'admin@konstellation.io',
  areToolsActive: true,
  accessLevel: AccessLevel.ADMIN,
  apiTokens: [apiToken1],
};

export const user1 = {
  id: 'userId1',
  email: 'userEmail1',
  lastActivity: '2020-02-02',
  username: 'username1',
  creationDate: '2020-02-02',
  __typename: 'User',
};

export const user2 = {
  id: 'userId2',
  email: 'userEmail2',
  lastActivity: '2020-02-03',
  username: 'username2',
  creationDate: '2020-02-03',
  __typename: 'User',
};

export const newUser = {
  id: 'userId3',
  email: 'userEmail3',
  lastActivity: '2020-02-04',
  username: 'username3',
  creationDate: '2020-02-04',
  __typename: 'User',
};
