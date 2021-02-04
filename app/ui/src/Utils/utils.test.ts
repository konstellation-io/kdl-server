import { mutationPayloadHelper, queryPayloadHelper } from './formUtils';

import { formatDate } from './format';
import { generateSlug } from './string';

describe('formatDate', () => {
  it('formats dates properly', () => {
    const date = new Date(Date.parse('01 Jan 1970 00:00:00 GMT'));

    expect(formatDate(date)).toBe('Jan 1, 1970');
    expect(formatDate(date, true)).toBe('Jan 1, 1970 1:00 AM');
  });
});

describe('generateSlug', () => {
  it('formats string properly', () => {
    const slug1 = generateSlug('hello');
    const slug2 = generateSlug('hel lo');
    const slug3 = generateSlug('he');
    const slug4 = generateSlug(' hello ');
    const slug5 = generateSlug(' h#el@l!!o ');

    const expectedSlug1 = 'hello';
    const expectedSlug2 = 'hel-lo';
    const expectedSlug3 = 'slug-he';
    const expectedSlug4 = 'hello';
    const expectedSlug5 = 'hello';

    expect(slug1).toBe(expectedSlug1);
    expect(slug2).toBe(expectedSlug2);
    expect(slug3).toBe(expectedSlug3);
    expect(slug4).toBe(expectedSlug4);
    expect(slug5).toBe(expectedSlug5);
  });
});

describe('mutationPayloadHelper anb queryPayloadHelper', () => {
  it('formats objects properly', () => {
    const payload1 = mutationPayloadHelper({ hello: 'world' });
    const payload2 = queryPayloadHelper({ hello: 'world' });

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
