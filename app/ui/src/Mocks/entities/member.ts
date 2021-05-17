import { newUser, user1, user2 } from './user';

export const member1 = {
  user: user1,
  accessLevel: 'ADMIN',
  addedDate: '2020-02-02',
  __typename: 'Member',
};

export const member2 = {
  user: user2,
  accessLevel: 'MANAGER',
  addedDate: '2020-02-03',
  __typename: 'Member',
};

export const newMember = {
  user: newUser,
  accessLevel: 'MANAGER',
  addedDate: '2020-02-03',
  __typename: 'Member',
};
