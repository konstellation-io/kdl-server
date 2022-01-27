const casual = require('casual');
const { buildRandomMembers } = require('./membersMock');
const buildRepository = require('./repositoryMock');

function buildRuntime(_, index) {
  return {
    id: casual.uuid,
    name: casual.name,
    desc: casual.words(200),
    labels: casual.array_of_words(n = 7),
    dockerImage: buildRepository(),
  };
}

module.exports = buildRuntime;
