/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateMembersInput, AccessLevel } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateMembers
// ====================================================

export interface UpdateMembers_updateMembers_members_user {
  __typename: "User";
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface UpdateMembers_updateMembers_members {
  __typename: "Member";
  user: UpdateMembers_updateMembers_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface UpdateMembers_updateMembers {
  __typename: "Project";
  id: string;
  members: UpdateMembers_updateMembers_members[];
}

export interface UpdateMembers {
  updateMembers: UpdateMembers_updateMembers;
}

export interface UpdateMembersVariables {
  input: UpdateMembersInput;
}
