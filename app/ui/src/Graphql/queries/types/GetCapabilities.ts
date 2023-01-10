/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCapabilities
// ====================================================

export interface GetCapabilities_capabilities {
  __typename: "Capability";
  id: string;
  name: string;
  default: boolean;
}

export interface GetCapabilities {
  capabilities: GetCapabilities_capabilities[];
}
