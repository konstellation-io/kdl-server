const { MockList } = require('apollo-server');

const relevances = require('./topic_relevance.json');
const casual = require('casual');
const buildProject = require('./projectMock');
const kgData = require('./kgMock');
const { buildMember, buildMeAsMember } = require('./membersMock');
const { meId, me } = require('./meMock');

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
    updateProject: (_, { input: { id, name, description, archived } }) => {
      const project = projects.find((project) => project.id === id);
      if (name) project.name = name;
      if (description) project.description = description;
      if (archived !== undefined) project.archived = archived;

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
    setStarredKGItem: (_, { input: { kgItemId, starred } }) => ({
      id: kgItemId,
      starred,
    }),
    regenerateSSHKey: () => ({
      id: meId,
      sshKey: this.SSHKey,
    }),
    setKGStarred: (_, { input: { kgItemId, starred } }) => ({
      kgItemId,
      starred,
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
        members: [buildMeAsMember()],
        archived: false,
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
    id: casual.id,
    category: casual.random_element(['Code', 'Paper']),
    topics: [
      {
        name: 'Topic 1',
        relevance: 0.8,
      },
      {
        name: 'Topic 2',
        relevance: 0.2,
      },
    ],
    title: casual.name,
    abstract: casual.words(200),
    authors: ['Xingyi Zhou', 'Vladlen Koltun', 'Philipp Krähenbühl'],
    score: casual.random,
    date: new Date().toISOString(),
    url: 'https://paperswithcode.com/paper/probabilistic-two-stage-detection',
  }),
};
