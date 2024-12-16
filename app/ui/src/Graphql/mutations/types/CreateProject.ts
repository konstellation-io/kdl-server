/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateProjectInput } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: CreateProject
// ====================================================

export interface CreateProject_createProject_repository {
  __typename: "Repository";
  url: string;
  error: string | null;
}

export interface CreateProject_createProject {
  __typename: "Project";
  id: string;
  name: string;
  description: string;
  favorite: boolean;
  creationDate: string;
  lastActivationDate: string;
  repository: CreateProject_createProject_repository | null;
  needAccess: boolean;
  archived: boolean;
  error: string | null;
}

export interface CreateProject {
  createProject: CreateProject_createProject;
}

export interface CreateProjectVariables {
  input: CreateProjectInput;
}
