export function formatString(
  str: string,
  replacements: { [id: string]: string | number | undefined }
) {
  Object.keys(replacements).forEach(key => {
    str = str.replaceAll(`%${key}%`, getString(replacements[key]));
  });
  return str;
}

function getString(unk: string | number | undefined): string {
  switch (typeof unk) {
    case 'undefined':
      return '';
    case 'number':
      return unk.toString();
    default:
      return unk;
  }
}
