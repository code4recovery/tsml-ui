//inspired by the functionality of jedwatson/classnames
export function formatClasses(
  ...args: Array<string | undefined | Record<string, boolean>>
) {
  return Object.values(args)
    .map(arg =>
      typeof arg === 'string'
        ? arg
        : Array.isArray(arg)
        ? arg.join(' ')
        : typeof arg === 'object'
        ? Object.keys(arg)
            .filter(key => !!arg[key])
            .join(' ')
        : null
    )
    .filter(e => e)
    .join(' ');
}
