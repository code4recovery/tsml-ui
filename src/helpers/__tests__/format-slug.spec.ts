import { formatSlug } from '../format-slug';

describe('formatSlug', () => {
  it('removes accents', () => {
    const actual = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
    const expected = 'aaaaaaeeeeiiiioooouuuunc';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });

  it('hyphen cases', () => {
    const actual = 'Foo Bar Baz';
    const expected = 'foo-bar-baz';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });

  it('removes invalid chars', () => {
    const actual = '!@#$%^&*()';
    const expected = '';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });

  it('removes whitespace and leading / trailing hyphens', () => {
    const actual = ' -foo-bar- ';
    const expected = 'foo-bar';

    expect(formatSlug(actual)).toStrictEqual(expected);
  });
});
