/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RegenerateSSHKey
// ====================================================

export interface RegenerateSSHKey_regenerateSSHKey_sshKey {
  __typename: 'SSHKey';
  public: string;
  private: string;
  creationDate: string;
  lastActivity: string | null;
}

export interface RegenerateSSHKey_regenerateSSHKey {
  __typename: 'User';
  id: string;
  sshKey: RegenerateSSHKey_regenerateSSHKey_sshKey;
}

export interface RegenerateSSHKey {
  regenerateSSHKey: RegenerateSSHKey_regenerateSSHKey;
}
