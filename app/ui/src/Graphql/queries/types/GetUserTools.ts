/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserTools
// ====================================================

export interface GetUserTools_project_toolUrls {
  __typename: "ToolUrls";
  knowledgeGalaxy: string;
  gitea: string;
  filebrowser: string;
  jupyter: string;
  vscode: string;
  drone: string;
  mlflow: string;
}

export interface GetUserTools_project {
  __typename: "Project";
  id: string;
  toolUrls: GetUserTools_project_toolUrls;
}

export interface GetUserTools_me {
  __typename: "User";
  id: string;
}

export interface GetUserTools {
  project: GetUserTools_project;
  me: GetUserTools_me;
}

export interface GetUserToolsVariables {
  id: string;
}
