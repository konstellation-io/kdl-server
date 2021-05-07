const casual = require('casual');

const buildUser = (_, index) => ({
  id: casual.uuid,
  username: casual.username,
  email: index === 0 ? 'Aaa@aaa.com' : casual.email,
  accessLevel:
    index === 0
      ? 'ADMIN'
      : casual.random_element(['VIEWER', 'MANAGER', 'ADMIN']),
});

module.exports = buildUser;
