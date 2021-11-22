import { newUser, user1, user2, userMe } from './user';
import { AccessLevel } from '../../Graphql/types/globalTypes';

export const memberMe = {
  user: userMe,
  accessLevel: AccessLevel.ADMIN,
  addedDate: '2020-02-02',
  __typename: 'Member',
};

export const member1 = {
  user: user1,
  accessLevel: AccessLevel.ADMIN,
  addedDate: '2020-02-02',
  __typename: 'Member',
};

export const member2 = {
  user: user2,
  accessLevel: AccessLevel.MANAGER,
  addedDate: '2020-02-03',
  __typename: 'Member',
};

export const newMember = {
  user: newUser,
  accessLevel: AccessLevel.MANAGER,
  addedDate: '2020-02-03',
  __typename: 'Member',
};
