/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RepositoryType, ProjectState } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetProjects
// ====================================================

export interface GetProjects_projects_repository {
  __typename: 'Repository';
  type: RepositoryType;
  url: string;
  error: string | null;
}

export interface GetProjects_projects_toolUrls {
  __typename: 'ToolUrls';
  drone: string;
  gitea: string;
  jupyter: string;
  minio: string;
  mlflow: string;
  vscode: string;
}

export interface GetProjects_projects {
  __typename: 'Project';
  id: string;
  name: string;
  description: string;
  favorite: boolean;
  creationDate: string;
  lastActivationDate: string;
  repository: GetProjects_projects_repository | null;
  state: ProjectState;
  error: string | null;
  toolUrls: GetProjects_projects_toolUrls;
}

export interface GetProjects {
  projects: GetProjects_projects[];
}
