//ensure array-ness for formatFeedbackEmail()
export function formatArray(unknown: unknown) {
  if (Array.isArray(unknown)) return unknown;
  const type = typeof unknown;
  if (type === 'string') return [unknown];
  if (type === 'object') return Object.values(unknown as object);
  return [];
}
