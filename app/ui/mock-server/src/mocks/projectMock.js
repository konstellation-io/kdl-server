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
      knowledgeGalaxyEnable: false,
      knowledgeGalaxy: 'https://filebrowser.org/',
      filebrowser: 'https://filebrowser.org/',
      mlflow: 'https://mlflow.org/',
      minio: 'https://minio.io/',
    },
    minioAccessKey: {
      accessKey: casual.uuid,
      secretKey: casual.uuid,
    },
  };
}

module.exports = buildProject;
