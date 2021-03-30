/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SetKGStarredInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: SetStarredKGItem
// ====================================================

export interface SetStarredKGItem_setKGStarred {
  __typename: 'SetKGStarredRes';
  kgItemId: string;
  starred: boolean;
}

export interface SetStarredKGItem {
  setKGStarred: SetStarredKGItem_setKGStarred;
}

export interface SetStarredKGItemVariables {
  input: SetKGStarredInput;
}
