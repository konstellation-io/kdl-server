/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RepositoryType, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetProject
// ====================================================

export interface GetProject_project_repository {
  __typename: 'Repository';
  type: RepositoryType;
  url: string;
  error: string | null;
}

export interface GetProject_project_toolUrls {
  __typename: 'ToolUrls';
  drone: string;
  gitea: string;
  jupyter: string;
  minio: string;
  mlflow: string;
  vscode: string;
}

export interface GetProject_project_members_user {
  __typename: 'User';
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface GetProject_project_members {
  __typename: 'Member';
  user: GetProject_project_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface GetProject_project {
  __typename: 'Project';
  id: string;
  name: string;
  description: string;
  favorite: boolean;
  creationDate: string;
  lastActivationDate: string;
  repository: GetProject_project_repository | null;
  needAccess: boolean;
  archived: boolean;
  error: string | null;
  toolUrls: GetProject_project_toolUrls;
  members: GetProject_project_members[];
}

export interface GetProject {
  project: GetProject_project;
}

export interface GetProjectVariables {
  id: string;
}
