/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

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
  apiTokens: GetMe_me_apiTokens[];
}

export interface GetMe {
  me: GetMe_me;
}
