import { CHECK } from 'kwc';
import { AccessLevel } from 'Graphql/types/globalTypes';

export function verifyUsername(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isLengthAllowed(value, 40),
    CHECK.matches(
      value,
      new RegExp(/^[a-zA-Z0-9._-]*$/g),
      'The username should contain only alphanumeric, dash (-), underscore (_) and dot (.) characters'
    ),
  ]);
}
export function verifyPassword(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.matches(
      value,
      new RegExp(/.{6,}/g),
      'The password length cannot be less than 6 characters'
    ),
    CHECK.matches(
      value,
      new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/g
      ),
      'The password should contain at least one digit, one special character (@$!%*?&), one lowercase character and one uppercase character'
    ),
  ]);
}

export function verifyEmail(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isEmailValid(value),
  ]);
}

export function verifyAccessLevel(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldNotInList(value, Object.values(AccessLevel)),
  ]);
}

export function verifyConfirmation(value: boolean) {
  return value ? true : 'You need to accept this';
}
