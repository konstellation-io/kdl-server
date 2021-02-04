import {
  ExternalRepositoryValues,
  ExternalRepositoryErrors,
  InternalRepositoryValues,
  InternalRepositoryErrors,
  InformationErrors,
  InformationValues,
  NewProject,
  RepositoryErrors,
  RepositoryValues,
} from './../models/NewProject';
import { initialNewProject, newProject } from './../cache';

import { cloneDeep } from 'lodash';

function useNewProject(section: keyof NewProject) {
  function updateValue(
    key:
      | keyof InformationValues
      | keyof RepositoryValues
      | keyof ExternalRepositoryValues
      | keyof InternalRepositoryValues,
    value: string | boolean
  ) {
    const newState = cloneDeep(newProject());
    // @ts-ignore
    newState[section].values[key] = value;

    newProject(newState);
  }

  function updateError(
    key:
      | keyof InformationErrors
      | keyof RepositoryErrors
      | keyof ExternalRepositoryErrors
      | keyof InternalRepositoryErrors,
    value: string
  ) {
    const newState = cloneDeep(newProject());
    // @ts-ignore
    newState[section].errors[key] = value;

    newProject(newState);
  }

  function clearError(key: string) {
    const newState = cloneDeep(newProject());
    // @ts-ignore
    newState[section].errors[key] = '';

    newProject(newState);
  }

  function clearAll() {
    newProject(initialNewProject);
  }

  return { updateValue, updateError, clearError, clearAll };
}

export default useNewProject;
