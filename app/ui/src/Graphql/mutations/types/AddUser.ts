/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AddUserInput, AccessLevel } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: AddUser
// ====================================================

export interface AddUser_addUser {
  __typename: 'User';
  id: string;
  email: string;
  accessLevel: AccessLevel;
  creationDate: string;
  lastActivity: string | null;
}

export interface AddUser {
  addUser: AddUser_addUser;
}

export interface AddUserVariables {
  input: AddUserInput;
}
