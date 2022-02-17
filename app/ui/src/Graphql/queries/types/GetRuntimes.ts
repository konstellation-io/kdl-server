/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetRuntimes
// ====================================================

export interface GetRuntimes_runtimes {
  __typename: "Runtime";
  id: string;
  name: string;
  desc: string;
  labels: string[] | null;
  dockerImage: string;
  dockerTag: string;
  runtimePod: string;
}

export interface GetRuntimes {
  runtimes: GetRuntimes_runtimes[];
}
