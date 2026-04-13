import { describe, expect, it } from 'vitest';
import { formatSlug } from '../../../src/helpers/format-slug';

describe('formatSlug', () => {
  it('removes accents', () => {
    const actual = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
    const expected = 'aaaaaaeeeeiiiioooouuuunc';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });

  it('kebab cases', () => {
    const actual = 'Foo Bar_Baz';
    const expected = 'foo-bar-baz';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });

  // todo add test for japanese characters

  it('removes whitespace and leading / trailing hyphens', () => {
    const actual = ' -foo  bar- ';
    const expected = 'foo-bar';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });
});
