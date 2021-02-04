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

export enum ProjectState {
  ARCHIVED = 'ARCHIVED',
  STARTED = 'STARTED',
  STOPPED = 'STOPPED',
}

export enum RepositoryType {
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
}

export enum ToolName {
  DRONE = 'DRONE',
  GITEA = 'GITEA',
  JUPYTER = 'JUPYTER',
  MINIO = 'MINIO',
  MLFLOW = 'MLFLOW',
  VSCODE = 'VSCODE',
}

export interface AddMembersInput {
  projectId: string;
  memberIds: string[];
}

export interface AddUserInput {
  email: string;
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

export interface RemoveApiTokenInput {
  apiTokenId: string;
}

export interface RemoveMemberInput {
  projectId: string;
  memberId: string;
}

export interface RemoveUsersInput {
  userIds: string[];
}

export interface RepositoryInput {
  type: RepositoryType;
  url: string;
}

export interface SetBoolFieldInput {
  id: string;
  value: boolean;
}

export interface UpdateAccessLevelInput {
  userIds: string[];
  accessLevel: AccessLevel;
}

export interface UpdateMemberInput {
  projectId: string;
  memberId: string;
  accessLevel: AccessLevel;
}

export interface UpdateProjectInput {
  id: string;
  name?: string | null;
  repository?: UpdateProjectRepositoryInput | null;
}

export interface UpdateProjectRepositoryInput {
  url: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
