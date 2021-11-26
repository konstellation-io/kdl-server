/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccessLevel } from '../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetMe
// ====================================================

export interface GetMe_me_apiTokens {
  __typename: 'ApiToken';
  id: string;
  name: string;
  creationDate: string;
  lastUsedDate: string;
}

export interface GetMe_me {
  __typename: 'User';
  id: string;
  email: string;
  areToolsActive: boolean;
  accessLevel: AccessLevel;
  apiTokens: GetMe_me_apiTokens[];
}

export interface GetMe {
  me: GetMe_me;
}
