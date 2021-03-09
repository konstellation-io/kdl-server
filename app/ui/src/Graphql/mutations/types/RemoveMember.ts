/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RemoveMemberInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RemoveMember
// ====================================================

export interface RemoveMember_removeMember_members_user {
  __typename: 'User';
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface RemoveMember_removeMember_members {
  __typename: 'Member';
  user: RemoveMember_removeMember_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface RemoveMember_removeMember {
  __typename: 'Project';
  id: string;
  members: RemoveMember_removeMember_members[];
}

export interface RemoveMember {
  removeMember: RemoveMember_removeMember;
}

export interface RemoveMemberVariables {
  input: RemoveMemberInput;
}
