const { MockList } = require('apollo-server');
const casual = require('casual');

const projectsIds = Array(8)
  .fill(0)
  .map(() => casual.uuid);

module.exports = {
  Query: () => ({
    me: () => ({
      id: casual.uuid,
      email: 'admin@intelygenz.com',
      username: 'admin',
      apiTokens: () => new MockList([4, 8]),
    }),
    projects: () =>
      projectsIds.map((id) => ({
        id,
      })),
    users: () => new MockList([20, 30]),
    project: ({ project }, { id }) => ({
      ...project,
      id,
    }),
    qualityProjectDesc: () => ({
      quality: Math.round((Math.random() * 1000) % 100),
    }),
  }),
  Mutation: () => ({
    updateProject: (_, { input: { id, name } }) => ({
      id,
      name,
    }),
    updateMember: (_, { input: { memberId, accessLevel } }) => ({
      id: memberId,
      accessLevel,
    }),
    removeMember: (_, { input: { memberId } }) => ({
      id: memberId,
    }),
    removeApiToken: (_, { input: { apiTokenId } }) => ({
      id: apiTokenId,
    }),
    addMembers: () => new MockList([2, 4]),
    addApiToken: this.ApiToken,
    updateAccessLevel: (_, { input: { userIds, accessLevel } }) =>
      userIds.map((userId) => ({
        id: userId,
        accessLevel,
      })),
    removeUsers: (_, { input: { userIds } }) =>
      userIds.map((userId) => ({
        id: userId,
      })),
    createProject: (_, { input }) => ({
      ...input,
      repository: {
        ...input.repository,
        connected: false,
      },
      id: 'some-new-id',
      favorite: false,
      state: 'STOPPED',
      creationDate: new Date().toUTCString(),
      lastActivationDate: new Date().toUTCString(),
      members: [],
      tools: [],
      areToolsActive: false,
    }),
    setActiveProjectTools: (_, { input }) => ({
      id: input.id,
      areToolsActive: input.value,
    }),
  }),
  ApiToken: () => ({
    id: casual.uuid,
    name: casual.name,
    creationDate: new Date().toUTCString(),
    lastUsedDate: new Date().toUTCString(),
    token: `uy3w89u4ty9t86reh9i0wrthunfiodw9iw90fuy45i985hu6ibhjygkcf4589hirtuybmvf2345uighrfjº209h7guj340t93y45etr0i2h30pv9ivph9n45ot3pi2rcjpqh9voptwgijr3cv’io56t4kr0exuy3w89u4ty9t86reh9i0wrthunfiodw9iw90fuy45i985hu6ibhjygkcf4589hirtuybmvf2p345uighrfj209h7guj340t93y45etr0i2h30pv9ivph9n45ot3pi2rcjpqh9cvst4kr0ex`,
  }),
  User: () => ({
    id: casual.uuid,
    email: casual.email,
    username: casual.username,
    creationDate: new Date().toUTCString(),
    accessLevel: casual.random_element(['ADMIN', 'VIEWER', 'MANAGER']),
    lastActivity: new Date().toUTCString(),
  }),
  Member: () => ({
    id: casual.uuid,
    email: casual.email,
    accessLevel: casual.random_element(['ADMIN', 'VIEWER', 'MANAGER']),
    addedDate: new Date().toUTCString(),
    lastActivity: new Date().toUTCString(),
  }),
  Project: () => ({
    id: casual.uuid,
    name: casual.name,
    description: casual.description,
    favorite: casual.boolean,
    repository: this.Repository,
    creationDate: () => new Date().toISOString(),
    lastActivationDate: () => new Date().toISOString(),
    error: casual.random_element([null, casual.error]),
    state: casual.random_element(['STARTED', 'STOPPED', 'ARCHIVED']),
    members: () => new MockList([4, 6]),
    toolUrls: () => ({
      gitea: 'https://gitea.io/en-us/',
      minio: 'https://min.io/',
      jupyter: 'https://jupyter.org/',
      vscode: 'https://code.visualstudio.com/',
      drone: 'https://www.drone.io/',
      mlflow: 'https://mlflow.org/',
    }),
  }),
  Repository: () => ({
    id: casual.uuid,
    type: casual.random_element(['INTERNAL', 'EXTERNAL']),
    url: casual.url,
    connected: casual.boolean,
  }),
  SSHKey: () => ({
    public: casual.uuid,
    private: casual.uuid,
    creationDate: new Date().toUTCString(),
    lastActivity: new Date().toUTCString(),
  }),
};
