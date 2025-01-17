const casual = require('casual');
const { buildRandomMembers } = require('./membersMock');
const buildRepository = require('./repositoryMock');
const activeProjectsCount = 4;

function buildProject(_, index) {
  return {
    id: casual.uuid,
    name: casual.name,
    description: casual.words(200),
    favorite: casual.boolean,
    repository: buildRepository(),
    creationDate: () => new Date().toISOString(),
    lastActivationDate: () => new Date().toISOString(),
    error: casual.random_element([null, casual.error]),
    needAccess: index < activeProjectsCount ? false : casual.boolean,
    members: buildRandomMembers(casual.integer(1, 5)),
    archived: index < activeProjectsCount ? false : casual.boolean,
    toolUrls: {
      knowledgeGalaxy: 'https://filebrowser.org/',
      filebrowser: 'https://filebrowser.org/',
      mlflow: 'https://mlflow.org/',
    },
  };
}

module.exports = buildProject;
