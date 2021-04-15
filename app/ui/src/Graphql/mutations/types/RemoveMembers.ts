/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RemoveMembersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RemoveMembers
// ====================================================

export interface RemoveMembers_removeMembers_members_user {
  __typename: 'User';
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface RemoveMembers_removeMembers_members {
  __typename: 'Member';
  user: RemoveMembers_removeMembers_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface RemoveMembers_removeMembers {
  __typename: 'Project';
  id: string;
  members: RemoveMembers_removeMembers_members[];
}

export interface RemoveMembers {
  removeMembers: RemoveMembers_removeMembers;
}

export interface RemoveMembersVariables {
  input: RemoveMembersInput;
}
