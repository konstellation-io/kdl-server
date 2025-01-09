import { CHECK } from 'kwc';

export function validateUrl(value: string) {
  console.log('Validating URL: ', value);
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value), CHECK.isUrlValid(value)]);
}

export function validateMandatoryField(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}
