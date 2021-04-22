import {
  maxProjectDescriptionLength,
  maxProjectNameLength,
  validateProjectName,
  validateProjectDescription,
  validateProjectId,
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

  describe('validateProjectId', function () {
    it.each`
      projectId                              | expected
      ${''}                                  | ${'This field cannot be empty'}
      ${'A'}                                 | ${`The id must start with a lowercase letter`}
      ${'4'}                                 | ${`The id must start with a lowercase letter`}
      ${'aa'}                                | ${`The id must contain at least 3 characters`}
      ${'ciao-mamma-guarda-come-mi-diverto'} | ${`The id must contain at most 20 characters`}
      ${'foo?bar'}                           | ${`The id only can contain lowercase alphanumeric and hyphens`}
      ${'foo-bar-'}                          | ${`The id is not correct`}
      ${'foo-bar-baz'}                       | ${true}
    `(
      'should return $expected when the project id is $projectId',
      ({ projectId, expected }) => {
        // Arrange.
        // Act.
        const result = validateProjectId(projectId);
        // Assert.
        expect(result).toBe(expected);
      }
    );
  });
});
