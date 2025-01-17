enum ROUTE {
  HOME = '/',
  USERS = '/users',
  USER_SSH_KEY = '/user/ssh-key',
  USER_API_TOKENS = '/user/api-tokens',
  USER_KUBECONFIG = '/user/kubeconfig',
  GENERATE_USER_API_TOKEN = '/user/api-tokens/new-token',
  PROJECTS = '/projects',
  PROJECT = '/projects/:projectId',
  PROJECT_OVERVIEW = '/projects/:projectId/overview',
  PROJECT_TOOL = '/projects/:projectId/tool',
  PROJECT_TOOL_FILEBROWSER = '/projects/:projectId/tool/filebrowser',
  PROJECT_TOOL_MLFLOW = '/projects/:projectId/tool/mlflow',
  PROJECT_TOOL_KG = '/projects/:projectId/tool/kg',
  NEW_PROJECT = '/new-project',
  PROJECT_CREATION = '/new-project/create',
}

export type RouteProjectParams = {
  projectId: string;
};

export const buildRoute = (route: ROUTE, projectId: string) => route.replace(':projectId', projectId);

export default ROUTE;
