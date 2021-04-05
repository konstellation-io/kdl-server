import {
  maxProjectDescriptionLength,
  maxProjectNameLength,
  validateProjectName,
  validateProjectDescription,
} from './InformationUtils';

const loremIpsum = 'Lorem ipsum dolor sit amet.';

describe('InformationUtils', () => {
  describe('validateProjectName', () => {
    it.each`
      name                                             | expected
      ${''}                                            | ${'This field cannot be empty'}
      ${loremIpsum.padStart(maxProjectNameLength + 1)} | ${`This field cannot be longer than ${maxProjectNameLength}`}
      ${loremIpsum}                                    | ${true}
    `(
      'should return $expected when projectName is $name',
      ({ name, expected }) => {
        // Arrange.
        // Act.
        const result = validateProjectName(name);
        // Assert.
        expect(result).toBe(expected);
      }
    );
  });

  describe('validateProjectDescription', () => {
    it.each`
      description                                             | expected
      ${''}                                                   | ${'This field cannot be empty'}
      ${loremIpsum.padStart(maxProjectDescriptionLength + 1)} | ${`This field cannot be longer than ${maxProjectDescriptionLength}`}
      ${loremIpsum}                                           | ${true}
    `(
      'should return $expected when description is $description',
      ({ description, expected }) => {
        // Arrange.
        // Act.
        const result = validateProjectDescription(description);
        // Assert.
        expect(result).toBe(expected);
      }
    );
  });
});
