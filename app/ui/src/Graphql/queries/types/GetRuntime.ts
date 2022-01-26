/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetRuntime
// ====================================================

export interface GetRuntime_runtimes {
  __typename: "Runtime";
  id: string;
  name: string;
  desc: string;
  labels: string[] | null;
  DockerImage: string;
}

export interface GetRuntime {
  runtimes: GetRuntime_runtimes[];
}

export interface GetRuntimeVariables {
  id: string;
}
