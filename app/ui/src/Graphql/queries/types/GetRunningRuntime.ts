/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PodStatus } from "./../../types/globalTypes";

// ====================================================
// GraphQL query operation: GetRunningRuntime
// ====================================================

export interface GetRunningRuntime_runningRuntime {
  __typename: "Runtime";
  id: string;
  name: string;
  desc: string;
  labels: string[] | null;
  dockerImage: string;
  dockerTag: string;
  runtimePod: string;
  runtimePodStatus: PodStatus;
}

export interface GetRunningRuntime {
  runningRuntime: GetRunningRuntime_runningRuntime | null;
}
