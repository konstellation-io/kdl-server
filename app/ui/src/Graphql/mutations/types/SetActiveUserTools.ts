/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SetActiveUserToolsInput } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: SetActiveUserTools
// ====================================================

export interface SetActiveUserTools_setActiveUserTools {
  __typename: "User";
  id: string;
  areToolsActive: boolean;
}

export interface SetActiveUserTools {
  setActiveUserTools: SetActiveUserTools_setActiveUserTools;
}

export interface SetActiveUserToolsVariables {
  input: SetActiveUserToolsInput;
}
