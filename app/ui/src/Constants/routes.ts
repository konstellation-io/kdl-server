enum ROUTE {
  HOME = '/',
  USERS = '/users',
  USER_SSH_KEY = '/user/ssh-key',
  USER_API_TOKENS = '/user/api-tokens',
  GENERATE_USER_API_TOKEN = '/user/api-tokens/new-token',
  PROJECTS = '/projects',
  PROJECT = '/projects/:projectId',
  PROJECT_OVERVIEW = '/projects/:projectId/overview',
  PROJECT_TOOL = '/projects/:projectId/tool',
  PROJECT_TOOL_GITEA = '/projects/:projectId/tool/gitea',
  PROJECT_TOOL_DRONE = '/projects/:projectId/tool/drone',
  PROJECT_TOOL_JUPYTER = '/projects/:projectId/tool/jupyter',
  PROJECT_TOOL_MINIO = '/projects/:projectId/tool/minio',
  PROJECT_TOOL_MLFLOW = '/projects/:projectId/tool/mlflow',
  PROJECT_TOOL_VSCODE = '/projects/:projectId/tool/vscode',
  PROJECT_KG = '/projects/:projectId/knowledge-galaxy',
  NEW_PROJECT = '/new-project',
  PROJECT_CREATION = '/new-project/create',
}

export type RouteProjectParams = {
  projectId: string;
};

export const buildRoute = (route: ROUTE, projectId: string) =>
  route.replace(':projectId', projectId);

export default ROUTE;
