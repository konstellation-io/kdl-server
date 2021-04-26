import { CHECK } from 'kwc';
import { replaceAll } from 'Utils/string';

export const maxProjectNameLength = 100;
export const maxProjectDescriptionLength = 100000;

export function validateProjectName(
  name: string,
  projectsNames: string[] = []
) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(name),
    CHECK.isLengthAllowed(name, maxProjectNameLength),
    CHECK.isItemDuplicated(
      name,
      projectsNames,
      'name. Please change it and choose a unique project name.'
    ),
  ]);
}

export function validateProjectDescription(description: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(description),
    CHECK.isLengthAllowed(description, maxProjectDescriptionLength),
  ]);
}

export function validateProjectId(id: string, projectsIds: string[] = []) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(id),
    CHECK.matches(id, /^[a-z]/, 'The id must start with a lowercase letter'),
    CHECK.matches(id, /.{3,}/, 'The id must contain at least 3 characters'),
    CHECK.matches(id, /^.{0,20}$/, 'The id must contain at most 20 characters'),
    CHECK.isAlphanumeric(
      replaceAll(id, /-/, ''),
      'The id only can contain lowercase alphanumeric and hyphens'
    ),
    CHECK.matches(
      id,
      /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
      'Enter a valid id consisting of letters, numbers or hyphens.'
    ),
    CHECK.isItemDuplicated(
      id,
      projectsIds,
      'id. This identifier has been used in another project, please choose a new one'
    ),
  ]);
}
