const { MockList } = require('apollo-server');
const data = require('./data0.json');
const relevances = require('./topic_relevance.json');
const casual = require('casual');

const kgData = data.map((d) => ({
  id: d.id,
  category: casual.random_element(['Code', 'Paper']),
  topics: Object.entries(JSON.parse(d.topics.replace(/[']+/g, '"'))).map(
    ([name, relevance]) => ({
      name,
      relevance,
    })
  ),
  title: d.title,
  abstract: d.abstract,
  authors: ['Xingyi Zhou', 'Vladlen Koltun', 'Philipp Krähenbühl'],
  score: d.score,
  date: new Date().toISOString(),
  url: 'https://paperswithcode.com/paper/probabilistic-two-stage-detection',
}));

const meId = casual.uuid;
const me = {
  id: meId,
  email: 'admin@intelygenz.com',
  username: 'admin',
  areToolsActive: true,
  apiTokens: () => new MockList([4, 8]),
};

const buildProject = () => ({
  id: casual.uuid,
  name: casual.name,
  description: casual.description,
  favorite: casual.boolean,
  repository: this.Repository,
  creationDate: () => new Date().toISOString(),
  lastActivationDate: () => new Date().toISOString(),
  error: casual.random_element([null, casual.error]),
  state: casual.random_element(['STARTED', 'STOPPED', 'ARCHIVED']),
  members: buildRandomMembers(casual.integer(1, 5)),
  toolUrls: () => ({
    gitea: 'https://gitea.io/en-us/',
    minio: 'https://min.io/',
    jupyter: 'https://jupyter.org/',
    vscode: 'https://code.visualstudio.com/',
    drone: 'https://www.drone.io/',
    mlflow: 'https://mlflow.org/',
  }),
});

const buildMember = () => ({
  user: {
    id: casual.uuid,
    email: casual.email,
    lastActivity: new Date().toUTCString(),
  },
  accessLevel: casual.random_element(['ADMIN', 'VIEWER', 'MANAGER']),
  addedDate: new Date().toUTCString(),
});

const buildRandomMembers = (memberCount) => {
  const members = [
    {
      user: {
        id: meId,
        email: me.email,
        lastActivity: new Date().toUTCString(),
      },
      accessLevel: 'ADMIN',
      addedDate: new Date().toUTCString(),
    },
  ];
  for (let i = 0; i < memberCount; i++) {
    members.push(buildMember());
  }
  return members;
};

const projects = Array(8).fill(0).map(buildProject);

module.exports = {
  Query: () => ({
    me: () => me,
    projects: () => projects,
    users: () => new MockList([20, 30]),
    project: (_, { id }) => projects.find((project) => project.id === id),
    qualityProjectDesc: () => ({
      quality: Math.round((Math.random() * 1000) % 100),
    }),
    knowledgeGraph: () => ({
      items: () => kgData,
      topics: () => relevances,
    }),
  }),
  Mutation: () => ({
    updateProject: (_, { input: { id, name, description } }) => {
      const project = projects.find((project) => project.id === id);
      if (name) project.name = name;
      if (description) project.description = description;

      return project;
    },
    addMembers: (_, { input: { projectId, userIds } }) => {
      const project = projects.find(({ id }) => id === projectId);
      const newMembers = userIds.map((id) => ({ ...buildMember(), id }));
      project.members = [...project.members, ...newMembers];

      return project;
    },
    removeMember: (_, { input: { projectId, userId } }) => {
      const project = projects.find(({ id }) => id === projectId);
      project.members = project.members.filter(
        ({ user }) => user.id !== userId
      );

      return project;
    },
    updateMember: (_, { input: { userId, accessLevel, projectId } }) => {
      const project = projects.find(({ id }) => id === projectId);
      const member = project.members.find(({ user }) => user.id === userId);
      member.accessLevel = accessLevel;

      return project;
    },
    removeApiToken: (_, { input: { apiTokenId } }) => ({
      id: apiTokenId,
    }),
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
    createProject: (_, { input }) => {
      const generatedProject = buildProject();
      const newProject = {
        ...generatedProject,
        ...input,
        repository: {
          ...input.repository,
          connected: false,
        },
        members: [],
      };
      projects.push(newProject);
      return newProject;
    },
    setActiveUserTools: (_, { input }) => ({
      id: meId,
      areToolsActive: input.active,
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
  Member: buildMember,
  Project: buildProject,
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
  KnowledgeGraphItem: () => ({
    title: casual.short_description,
    type: casual.random_element(['Code', 'Paper']),
    score: casual.random,
  }),
};
