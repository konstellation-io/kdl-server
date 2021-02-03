/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddMembersInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: AddMembers
// ====================================================

export interface AddMembers_addMembers {
  __typename: 'Member';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  addedDate: string;
  lastActivity: string | null;
}

export interface AddMembers {
  addMembers: AddMembers_addMembers[];
}

export interface AddMembersVariables {
  input: AddMembersInput;
}
