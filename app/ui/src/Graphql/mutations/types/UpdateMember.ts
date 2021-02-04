/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateMemberInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UpdateMember
// ====================================================

export interface UpdateMember_updateMember {
  __typename: 'Member';
  id: string;
  accessLevel: AccessLevel;
}

export interface UpdateMember {
  updateMember: UpdateMember_updateMember;
}

export interface UpdateMemberVariables {
  input: UpdateMemberInput;
}
