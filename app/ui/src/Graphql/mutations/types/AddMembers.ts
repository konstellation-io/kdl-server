/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddMembersInput, AccessLevel } from '../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: AddMembers
// ====================================================

export interface AddMembers_addMembers_members_user {
  __typename: 'User';
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface AddMembers_addMembers_members {
  __typename: 'Member';
  user: AddMembers_addMembers_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface AddMembers_addMembers {
  __typename: 'Project';
  id: string;
  members: AddMembers_addMembers_members[];
}

export interface AddMembers {
  addMembers: AddMembers_addMembers;
}

export interface AddMembersVariables {
  input: AddMembersInput;
}
