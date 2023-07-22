//turn Mountain View into mountain-view
export function formatSlug(str: string) {
  str = str.trim().toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaaaeeeeiiiioooouuuunc------';

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumerics
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse hyphens
    .replace(/^-+/, '') // trim hyphens from start
    .replace(/-+$/, ''); // trim hyphens from end
}
