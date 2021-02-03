/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetProjectMembers
// ====================================================

export interface GetProjectMembers_project_members {
  __typename: 'Member';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  addedDate: string;
  lastActivity: string | null;
}

export interface GetProjectMembers_project {
  __typename: 'Project';
  members: GetProjectMembers_project_members[];
}

export interface GetProjectMembers {
  project: GetProjectMembers_project;
}

export interface GetProjectMembersVariables {
  id: string;
}
