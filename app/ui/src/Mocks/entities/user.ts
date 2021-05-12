import { apiToken1 } from './apiToken';

export const userMe = {
  id: 'userMe',
  email: 'admin@konstellation.io',
  areToolsActive: true,
  accessLevel: 'ADMIN',
  apiTokens: [apiToken1],
};

export const user1 = {
  id: 'userId1',
  email: 'userEmail1',
  lastActivity: '2020-02-02',
};

export const user2 = {
  id: 'userId2',
  email: 'userEmail2',
  lastActivity: '2020-02-03',
};
