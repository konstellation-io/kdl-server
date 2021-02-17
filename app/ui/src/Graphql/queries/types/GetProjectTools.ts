/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetProjectTools
// ====================================================

export interface GetProjectTools_project_toolUrls {
  __typename: 'ToolUrls';
  gitea: string;
  minio: string;
  jupyter: string;
  vscode: string;
  drone: string;
  mlflow: string;
}

export interface GetProjectTools_project {
  __typename: 'Project';
  id: string;
  toolUrls: GetProjectTools_project_toolUrls;
  areToolsActive: boolean | null;
}

export interface GetProjectTools {
  project: GetProjectTools_project;
}

export interface GetProjectToolsVariables {
  id: string;
}
