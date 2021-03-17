import { CHECK } from 'kwc';

export function validateProjectName(name: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(name),
    CHECK.isLengthAllowed(name, 100),
  ]);
}
export function validateProjectDescription(description: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(description),
    CHECK.isLengthAllowed(description, 100000),
  ]);
}
