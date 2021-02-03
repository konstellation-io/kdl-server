/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SetBoolFieldInput } from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: SetActiveProjectTools
// ====================================================

export interface SetActiveProjectTools_setActiveProjectTools {
  __typename: 'Project';
  id: string;
  areToolsActive: boolean | null;
}

export interface SetActiveProjectTools {
  setActiveProjectTools: SetActiveProjectTools_setActiveProjectTools;
}

export interface SetActiveProjectToolsVariables {
  input: SetBoolFieldInput;
}
