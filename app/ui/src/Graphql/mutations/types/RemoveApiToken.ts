/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RemoveApiTokenInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: RemoveApiToken
// ====================================================

export interface RemoveApiToken_removeApiToken {
  __typename: 'ApiToken';
  id: string;
}

export interface RemoveApiToken {
  removeApiToken: RemoveApiToken_removeApiToken;
}

export interface RemoveApiTokenVariables {
  input: RemoveApiTokenInput;
}
