/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ToolName } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetProjectTools
// ====================================================

export interface GetProjectTools_project_tools {
  __typename: 'Tool';
  id: string;
  toolName: ToolName;
  url: string;
}

export interface GetProjectTools_project {
  __typename: 'Project';
  id: string;
  tools: GetProjectTools_project_tools[];
  areToolsActive: boolean | null;
}

export interface GetProjectTools {
  project: GetProjectTools_project;
}

export interface GetProjectToolsVariables {
  id: string;
}
