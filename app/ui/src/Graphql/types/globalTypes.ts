/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AccessLevel {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

export enum KnowledgeGraphItemCat {
  Code = 'Code',
  Paper = 'Paper',
}

export enum RepositoryType {
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
}

export interface AddMembersInput {
  projectId: string;
  userIds: string[];
}

export interface AddUserInput {
  email: string;
  username: string;
  password: string;
  accessLevel: AccessLevel;
}

export interface ApiTokenInput {
  userId: string;
  name?: string | null;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  repository: RepositoryInput;
}

export interface ExternalRepository {
  url: string;
  username: string;
  token: string;
}

export interface InternalRepository {
  name: string;
}

export interface RemoveApiTokenInput {
  apiTokenId: string;
}

export interface RemoveMemberInput {
  projectId: string;
  userId: string;
}

export interface RemoveUsersInput {
  userIds: string[];
}

export interface RepositoryInput {
  type: RepositoryType;
  external?: ExternalRepository | null;
  internal?: InternalRepository | null;
}

export interface SetActiveUserToolsInput {
  active: boolean;
}

export interface SetKGStarredInput {
  projectId: string;
  kgItemId: string;
  starred: boolean;
}

export interface UpdateAccessLevelInput {
  userIds: string[];
  accessLevel: AccessLevel;
}

export interface UpdateExternalRepositoryInput {
  url: string;
  username: string;
  token: string;
}

export interface UpdateInternalRepositoryInput {
  name: string;
}

export interface UpdateMemberInput {
  projectId: string;
  userId: string;
  accessLevel: AccessLevel;
}

export interface UpdateProjectInput {
  id: string;
  name?: string | null;
  description?: string | null;
  repository?: UpdateProjectRepositoryInput | null;
  archived?: boolean | null;
}

export interface UpdateProjectRepositoryInput {
  type: RepositoryType;
  external?: UpdateExternalRepositoryInput | null;
  internal?: UpdateInternalRepositoryInput | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
