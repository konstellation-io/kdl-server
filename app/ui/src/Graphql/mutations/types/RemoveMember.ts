/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RemoveMemberInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RemoveMember
// ====================================================

export interface RemoveMember_removeMember {
  __typename: 'Member';
  id: string;
}

export interface RemoveMember {
  removeMember: RemoveMember_removeMember;
}

export interface RemoveMemberVariables {
  input: RemoveMemberInput;
}
