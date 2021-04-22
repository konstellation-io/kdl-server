import { CHECK } from 'kwc';
import { replaceAll } from '../../../../Utils/string';

export const maxProjectNameLength = 100;
export const maxProjectDescriptionLength = 100000;

export function validateProjectName(name: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(name),
    CHECK.isLengthAllowed(name, maxProjectNameLength),
  ]);
}

export function validateProjectDescription(description: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(description),
    CHECK.isLengthAllowed(description, maxProjectDescriptionLength),
  ]);
}

export function validateProjectId(projectId: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(projectId),
    CHECK.matches(
      projectId,
      /^[a-z]/,
      'The id must start with a lowercase letter'
    ),
    CHECK.matches(
      projectId,
      /.{3,}/,
      'The id must contain at least 3 characters'
    ),
    CHECK.matches(
      projectId,
      /^.{0,20}$/,
      'The id must contain at most 20 characters'
    ),
    CHECK.isAlphanumeric(
      replaceAll(projectId, /-/, ''),
      'The id only can contain lowercase alphanumeric and hyphens'
    ),
    CHECK.matches(
      projectId,
      /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
      'The id is not correct'
    ),
  ]);
}
