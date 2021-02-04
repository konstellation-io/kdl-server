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
  id: string;
  type: RepositoryType;
  url: string;
  connected: boolean;
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
}

export interface GetProjects {
  projects: GetProjects_projects[];
}
