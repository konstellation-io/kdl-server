import { validateMandatoryField, validateUrl } from './RepositoryDetailsUtils';

describe('RepositoryDetailsUtils', () => {
  describe('validateUrl', () => {
    it.each`
      url                         | expected
      ${''}                       | ${'This field cannot be empty'}
      ${'www.google'}             | ${'Invalid url format'}
      ${'www.google.com'}         | ${'Invalid url format'}
      ${'http://www.google.com'}  | ${true}
      ${'https://www.google.com'} | ${true}
    `('should return $expected when url is $url', ({ url, expected }) => {
      // Arrange.
      // Act.
      const result = validateUrl(url);
      // Assert.
      expect(result).toBe(expected);
    });
  });

  describe('validateMandatoryField', () => {
    it.each`
      field                       | expected
      ${''}                       | ${'This field cannot be empty'}
      ${'https://www.google.com'} | ${true}
    `('should return $expected when field is $field', ({ field, expected }) => {
      // Arrange.
      // Act.
      const result = validateMandatoryField(field);
      // Assert.
      expect(result).toBe(expected);
    });
  });
});
