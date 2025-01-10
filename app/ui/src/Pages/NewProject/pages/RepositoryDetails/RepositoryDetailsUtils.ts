import { CHECK } from 'kwc';

export function validateUrl(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value), CHECK.isUrlValid(value)]);
}

export function validateMandatoryField(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}
