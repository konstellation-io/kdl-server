const casual = require('casual');
const { me } = require('./meMock.js');

const meAsMember = {
  user: me,
  accessLevel: 'ADMIN',
  addedDate: new Date().toUTCString(),
};

function buildRandomMembers(memberCount) {
  const members = [meAsMember];
  for (let i = 0; i < memberCount; i++) {
    members.push(buildMember());
  }
  return members;
}

function buildMember() {
  return {
    user: {
      id: casual.uuid,
      email: casual.email,
      lastActivity: new Date().toUTCString(),
    },
    accessLevel: casual.random_element(['ADMIN', 'VIEWER', 'MANAGER']),
    addedDate: new Date().toUTCString(),
  };
}

module.exports = { buildRandomMembers, meAsMember, buildMember };
