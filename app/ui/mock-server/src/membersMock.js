const casual = require('casual');
const { meId, me } = require('./meMock.js');

function buildMeAsMember() {
  return {
    user: {
      id: meId,
      email: me.email,
      lastActivity: new Date().toUTCString(),
    },
    accessLevel: 'ADMIN',
    addedDate: new Date().toUTCString(),
  };
}

function buildRandomMembers(memberCount) {
  const members = [buildMeAsMember()];
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

module.exports = { buildRandomMembers, buildMeAsMember, buildMember };
