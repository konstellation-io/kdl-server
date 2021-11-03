const casual = require('casual');
const buildProject = require('./mocks/projectMock');
const buildUser = require('./mocks/usersMock');
const { buildMember, meAsMember } = require('./mocks/membersMock');
const { meId, me } = require('./mocks/meMock');

const projects = Array(8).fill(0).map(buildProject);
const users = Array(casual.integer(20, 30)).fill(0).map(buildUser);

module.exports = {
  Query: () => ({
    me: () => me,
    projects: () => projects,
    users: () => users,
    project: (_, { id }) => projects.find((project) => project.id === id),
  }),
  Mutation: () => ({
    updateProject: (_, { input: { id, name, description, archived } }) => {
      const project = projects.find((p) => p.id === id);
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
    removeMembers: (_, { input: { projectId, userIds } }) => {
      const project = projects.find(({ id }) => id === projectId);
      project.members = project.members.filter(
        ({ user }) => !userIds.includes(user.id)
      );

      return project;
    },
    updateMembers: (_, { input: { userIds, accessLevel, projectId } }) => {
      const project = projects.find(({ id }) => id === projectId);

      userIds.forEach((userId) => {
        const member = project.members.find(({ user }) => user.id === userId);
        member.accessLevel = accessLevel;
      });

      return project;
    },
    removeApiToken: (_, { input: { apiTokenId } }) => ({
      id: apiTokenId,
    }),
    regenerateSSHKey: () => ({
      id: meId,
      sshKey: this.SSHKey,
    }),
    addApiToken: this.ApiToken,
    updateAccessLevel: (_, { input: { userIds, accessLevel } }) => {
      for (const id of userIds) {
        const user = users.find((user) => user.id === id);
        user.accessLevel = accessLevel;
      }
      return users;
    },
    removeUsers: (_, { input: { userIds } }) =>
      userIds.map((userId) => ({
        id: userId,
      })),
    createProject: (_, { input }) => {
      const hasError = false;
      if (hasError) throw new Error(casual.words(100));

      const casualProject = buildProject();
      const newProject = {
        ...casualProject,
        ...input,
        repository: {
          type: input.repository.type,
          url:
            input.repository.type === 'INTERNAL'
              ? `${casual.url}${input.id}`
              : input.repository.external.url,
          error: false,
        },
        members: [meAsMember],
        archived: false,
        needAccess: false,
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
    type: casual.random_element(['INTERNAL', 'EXTERNAL']),
    url: casual.url,
    error: false,
  }),
  SSHKey: () => ({
    public: casual.uuid,
    private: casual.uuid,
    creationDate: new Date().toUTCString(),
    lastActivity: new Date().toUTCString(),
  }),
};
