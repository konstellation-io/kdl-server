import { user1, user2 } from './entities/user';
import { AccessLevel } from '../Graphql/types/globalTypes';

export default {
  updateMembers: {
    id: 'projectId',
    members: [
      {
        user: user1,
        accessLevel: AccessLevel.ADMIN,
        addedDate: '2020-02-02',
      },
      {
        user: user2,
        accessLevel: AccessLevel.ADMIN,
        addedDate: '2020-02-02',
      },
    ],
  },
};
