const ID_MAX_LENGTH = 20;
const INVALID_ID_CHARS_REGEXP = /[^a-z0-9-]/g;
const SPACES_REGEXP = / +/g;

export function generateSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(SPACES_REGEXP, '-')
    .replace(INVALID_ID_CHARS_REGEXP, '')
    .substr(0, ID_MAX_LENGTH);
}
export function replaceAll(text: string, regex: RegExp, replaceWith: string): string {
  return text.replace(new RegExp(regex, 'g'), replaceWith);
}

export function getErrorMsg(validation: string | boolean): string {
  return validation === true ? '' : (validation as string);
}
