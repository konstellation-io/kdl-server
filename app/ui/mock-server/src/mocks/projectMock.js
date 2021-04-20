const casual = require('casual');
const { buildRandomMembers } = require('./membersMock');

function buildProject() {
  return {
    id: casual.uuid,
    name: casual.name,
    description: casual.words(200),
    favorite: casual.boolean,
    repository: this.Repository,
    creationDate: () => new Date().toISOString(),
    lastActivationDate: () => new Date().toISOString(),
    error: casual.random_element([null, casual.error]),
    needAccess: casual.boolean,
    members: buildRandomMembers(casual.integer(1, 5)),
    archived: casual.boolean,
    toolUrls: () => ({
      gitea: 'https://gitea.io/en-us/',
      minio: 'https://min.io/',
      jupyter: 'https://jupyter.org/',
      vscode: 'https://code.visualstudio.com/',
      drone: 'https://www.drone.io/',
      mlflow: 'https://mlflow.org/',
    }),
  };
}

module.exports = buildProject;
