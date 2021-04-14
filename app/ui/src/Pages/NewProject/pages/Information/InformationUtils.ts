import { CHECK } from 'kwc';

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
