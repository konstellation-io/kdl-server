/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSSHKey
// ====================================================

export interface GetSSHKey_sshKey {
  __typename: 'SSHKey';
  public: string;
  private: string;
  creationDate: string;
  lastActivity: string | null;
}

export interface GetSSHKey {
  sshKey: GetSSHKey_sshKey;
}
