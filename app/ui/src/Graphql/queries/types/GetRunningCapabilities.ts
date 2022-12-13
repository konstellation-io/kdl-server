/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetRunningCapabilities
// ====================================================

export interface GetRunningCapabilities_runningCapability {
  __typename: "Capability";
  id: string;
  name: string;
  default: boolean;
}

export interface GetRunningCapabilities {
  runningCapability: GetRunningCapabilities_runningCapability | null;
}
