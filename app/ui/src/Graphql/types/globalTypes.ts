/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AccessLevel {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  VIEWER = "VIEWER",
}

export enum RepositoryAuthMethod {
  PASSWORD = "PASSWORD",
  TOKEN = "TOKEN",
}

export enum RepositoryType {
  EXTERNAL = "EXTERNAL",
  INTERNAL = "INTERNAL",
}

export interface AddMembersInput {
  projectId: string;
  userIds: string[];
}

export interface ApiTokenInput {
  userId: string;
  name?: string | null;
}

export interface CreateProjectInput {
  id: string;
  name: string;
  description: string;
  repository: RepositoryInput;
}

export interface DeleteProjectInput {
  id: string;
}

export interface ExternalRepositoryInput {
  url: string;
  username: string;
  credential: string;
  authMethod: RepositoryAuthMethod;
}

export interface RemoveApiTokenInput {
  apiTokenId: string;
}

export interface RemoveMembersInput {
  projectId: string;
  userIds: string[];
}

export interface RepositoryInput {
  type: RepositoryType;
  external?: ExternalRepositoryInput | null;
}

export interface SetActiveUserToolsInput {
  active: boolean;
  runtimeId?: string | null;
  capabilitiesId?: string | null;
}

export interface UpdateAccessLevelInput {
  userIds: string[];
  accessLevel: AccessLevel;
}

export interface UpdateMembersInput {
  projectId: string;
  userIds: string[];
  accessLevel: AccessLevel;
}

export interface UpdateProjectInput {
  id: string;
  name?: string | null;
  description?: string | null;
  archived?: boolean | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
