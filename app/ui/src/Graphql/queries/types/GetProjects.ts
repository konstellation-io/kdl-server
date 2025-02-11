/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccessLevel } from "./../../types/globalTypes";

// ====================================================
// GraphQL query operation: GetProjects
// ====================================================

export interface GetProjects_projects_repository {
  __typename: "Repository";
  url: string;
  error: string | null;
}

export interface GetProjects_projects_toolUrls {
  __typename: "ToolUrls";
  knowledgeGalaxyEnabled: boolean;
  knowledgeGalaxy: string;
  filebrowser: string;
  mlflow: string;
  minio: string;
}

export interface GetProjects_projects_members_user {
  __typename: "User";
  id: string;
  email: string;
  lastActivity: string | null;
}

export interface GetProjects_projects_members {
  __typename: "Member";
  user: GetProjects_projects_members_user;
  accessLevel: AccessLevel;
  addedDate: string;
}

export interface GetProjects_projects {
  __typename: "Project";
  id: string;
  name: string;
  description: string;
  favorite: boolean;
  creationDate: string;
  lastActivationDate: string;
  repository: GetProjects_projects_repository | null;
  needAccess: boolean;
  archived: boolean;
  error: string | null;
  toolUrls: GetProjects_projects_toolUrls;
  members: GetProjects_projects_members[];
}

export interface GetProjects {
  projects: GetProjects_projects[];
}
