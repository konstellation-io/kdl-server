/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSSHKey
// ====================================================

export interface GetSSHKey_me_sshKey {
  __typename: "SSHKey";
  public: string;
  private: string;
  creationDate: string;
  lastActivity: string | null;
}

export interface GetSSHKey_me {
  __typename: "User";
  id: string;
  sshKey: GetSSHKey_me_sshKey;
}

export interface GetSSHKey {
  me: GetSSHKey_me;
}
