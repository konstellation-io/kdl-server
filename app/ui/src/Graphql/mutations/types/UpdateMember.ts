/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateMemberInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateMember
// ====================================================

export interface UpdateMember_updateMember_members_user {
  __typename: 'User';
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface UpdateMember_updateMember_members {
  __typename: 'Member';
  user: UpdateMember_updateMember_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface UpdateMember_updateMember {
  __typename: 'Project';
  id: string;
  members: UpdateMember_updateMember_members[];
}

export interface UpdateMember {
  updateMember: UpdateMember_updateMember;
}

export interface UpdateMemberVariables {
  input: UpdateMemberInput;
}
