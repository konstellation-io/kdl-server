enum ROUTE {
  HOME = '/',
  USERS = '/users',
  USER_SSH_KEY = '/user/ssh-key',
  USER_API_TOKENS = '/user/api-tokens',
  GENERATE_USER_API_TOKEN = '/user/api-tokens/new-token',
  NEW_USER = '/new-user',
  PROJECTS = '/projects',
  PROJECT = '/projects/:projectId',
  PROJECT_OVERVIEW = '/projects/:projectId/overview',
  PROJECT_TOOLS = '/projects/:projectId/tools',
  PROJECT_KG = '/projects/:projectId/knowledge-graph',
  NEW_PROJECT = '/new-project',
  PROJECT_CREATION = '/new-project/create',
}

export type RouteProjectParams = {
  projectId: string;
};

export const buildRoute = (route: ROUTE, projectId: string) =>
  route.replace(':projectId', projectId);

export default ROUTE;
