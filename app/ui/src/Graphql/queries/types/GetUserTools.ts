/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserTools
// ====================================================

export interface GetUserTools_project_toolUrls {
  __typename: "ToolUrls";
  knowledgeGalaxyEnabled: boolean;
  knowledgeGalaxy: string;
  filebrowser: string;
  mlflow: string;
  minio: string;
}

export interface GetUserTools_project {
  __typename: "Project";
  id: string;
  toolUrls: GetUserTools_project_toolUrls;
}

export interface GetUserTools_me_userTools {
  __typename: "UserTools";
  currentStorageSize: string;
}

export interface GetUserTools_me {
  __typename: "User";
  id: string;
  userTools: GetUserTools_me_userTools;
}

export interface GetUserTools {
  project: GetUserTools_project;
  me: GetUserTools_me;
}

export interface GetUserToolsVariables {
  id: string;
}
