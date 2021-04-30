const { MockList } = require('apollo-server');
const casual = require('casual');

const meId = casual.uuid;
const me = {
  id: meId,
  email: 'admin@intelygenz.com',
  username: 'admin',
  areToolsActive: true,
  apiTokens: () => new MockList([4, 8]),
  accessLevel: 'MANAGER',
};

module.exports = { me, meId };
