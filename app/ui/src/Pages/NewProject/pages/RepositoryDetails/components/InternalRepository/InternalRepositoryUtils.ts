import { CHECK } from 'kwc';
import { replaceAll } from 'Utils/string';

export function validateSlug(value: string) {
  return CHECK.getValidationError([
    CHECK.isLowerCase(value),
    CHECK.matches(value, /^[a-z]/, 'Name must start with a lowercase letter'),
    CHECK.matches(value, /.{3,}/, 'Name must contain at least 3 characters'),
    CHECK.matches(
      value,
      /^.{0,100}$/,
      'Name must contain at most 100 characters'
    ),
    CHECK.isAlphanumeric(
      replaceAll(value, /-/, ''),
      'Name only can contain lowercase alphanumeric and hyphens'
    ),
    CHECK.isSlug(value),
  ]);
}
