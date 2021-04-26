import { mutationPayloadHelper, queryPayloadHelper } from './formUtils';

import { formatDate } from './format';
import { generateSlug } from './string';

describe('formatDate', () => {
  it('formats dates properly', () => {
    // Arrange.
    // Act.
    const date = new Date(Date.parse('01 Jan 1970 00:00:00 GMT'));

    // Assert.
    expect(formatDate(date)).toBe('Jan 1, 1970');
    expect(formatDate(date, true)).toBe('Jan 1, 1970 12:00 AM');
  });
});

describe('generateSlug', () => {
  it.each`
    name             | expected
    ${'hello'}       | ${'hello'}
    ${'hel lo'}      | ${'hel-lo'}
    ${'he'}          | ${'he'}
    ${' hello '}     | ${'hello'}
    ${' h#el@l!!o '} | ${'hello'}
  `('formats string properly', ({ name, expected }) => {
    // Arrange.
    // Act.
    const slug = generateSlug(name);

    // Assert.
    expect(slug).toBe(expected);
  });
});

describe('mutationPayloadHelper anb queryPayloadHelper', () => {
  it('formats objects properly', () => {
    // Arrange.
    // Act.
    const payload1 = mutationPayloadHelper({ hello: 'world' });
    const payload2 = queryPayloadHelper({ hello: 'world' });

    // Assert.
    expect(payload1).toStrictEqual({
      variables: {
        input: {
          hello: 'world',
        },
      },
    });
    expect(payload2).toStrictEqual({
      hello: 'world',
    });
  });
});
