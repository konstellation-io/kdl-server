const casual = require('casual');

const buildUser = () => ({
  id: casual.uuid,
  username: casual.username,
  email: casual.email,
  accessLevel: casual.random_element(['VIEWER', 'MANAGER', 'ADMIN']),
});

module.exports = buildUser;
