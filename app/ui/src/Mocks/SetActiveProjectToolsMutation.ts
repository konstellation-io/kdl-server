import { userMe } from './entities/user';

export default {
  setActiveUserTools: {
    id: userMe.id,
    areToolsActive: false,
  },
};
