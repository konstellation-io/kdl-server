/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateProjectInput, RepositoryType } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateProject
// ====================================================

export interface UpdateProject_updateProject_repository {
  __typename: "Repository";
  error: string | null;
  type: RepositoryType;
  url: string;
}

export interface UpdateProject_updateProject {
  __typename: "Project";
  id: string;
  name: string;
  description: string;
  repository: UpdateProject_updateProject_repository | null;
  archived: boolean;
}

export interface UpdateProject {
  updateProject: UpdateProject_updateProject;
}

export interface UpdateProjectVariables {
  input: UpdateProjectInput;
}
