/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SetStarredKGItemInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: SetStarredKGItem
// ====================================================

export interface SetStarredKGItem_setStarredKGItem {
  __typename: 'SetStarredKGItemResponse';
  id: string;
  starred: boolean;
}

export interface SetStarredKGItem {
  setStarredKGItem: SetStarredKGItem_setStarredKGItem;
}

export interface SetStarredKGItemVariables {
  input: SetStarredKGItemInput;
}
