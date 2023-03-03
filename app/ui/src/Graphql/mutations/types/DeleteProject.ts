/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteProjectInput } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteProject
// ====================================================

export interface DeleteProject_deleteProject {
  __typename: "Project";
  id: string;
}

export interface DeleteProject {
  deleteProject: DeleteProject_deleteProject | null;
}

export interface DeleteProjectVariables {
  input: DeleteProjectInput;
}
