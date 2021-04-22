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
      name                                             | names           | expected
      ${''}                                            | ${[]}           | ${'This field cannot be empty'}
      ${loremIpsum.padStart(maxProjectNameLength + 1)} | ${[]}           | ${`This field cannot be longer than ${maxProjectNameLength}`}
      ${loremIpsum}                                    | ${[loremIpsum]} | ${`Duplicated name. Please change it and choose a unique project name.`}
      ${loremIpsum}                                    | ${[]}           | ${true}
    `(
      'should return $expected when projectName is $name',
      ({ name, names, expected }) => {
        // Arrange.
        // Act.
        const result = validateProjectName(name, names);
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
      id                                     | ids            | expected
      ${''}                                  | ${[]}          | ${'This field cannot be empty'}
      ${'A'}                                 | ${[]}          | ${`The id must start with a lowercase letter`}
      ${'4'}                                 | ${[]}          | ${`The id must start with a lowercase letter`}
      ${'aa'}                                | ${[]}          | ${`The id must contain at least 3 characters`}
      ${'ciao-mamma-guarda-come-mi-diverto'} | ${[]}          | ${`The id must contain at most 20 characters`}
      ${'foo?bar'}                           | ${[]}          | ${`The id only can contain lowercase alphanumeric and hyphens`}
      ${'foo-bar-'}                          | ${[]}          | ${`The id is not correct`}
      ${'foo-bar'}                           | ${['foo-bar']} | ${`Duplicated id. This identifier has been used in another project, please choose a new one`}
      ${'foo-bar-baz'}                       | ${[]}          | ${true}
    `(
      'should return $expected when the project id is $projectId',
      ({ id, ids, expected }) => {
        // Arrange.
        // Act.
        const result = validateProjectId(id, ids);
        // Assert.
        expect(result).toBe(expected);
      }
    );
  });
});
