/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ApiTokenInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: AddApiToken
// ====================================================

export interface AddApiToken_addApiToken {
  __typename: 'ApiToken';
  id: string;
  name: string;
  creationDate: string;
  lastUsedDate: string;
  token: string;
}

export interface AddApiToken {
  addApiToken: AddApiToken_addApiToken | null;
}

export interface AddApiTokenVariables {
  input: ApiTokenInput;
}
