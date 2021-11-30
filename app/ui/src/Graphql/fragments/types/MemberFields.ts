/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccessLevel } from "./../../types/globalTypes";

// ====================================================
// GraphQL fragment: MemberFields
// ====================================================

export interface MemberFields_user {
  __typename: "User";
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface MemberFields {
  __typename: "Member";
  user: MemberFields_user;
  accessLevel: AccessLevel;
  addedDate: string;
}
