/**
 * Recursively converts object keys from snake_case to camelCase.
 * Handles arrays and nested objects.
 */
export function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/(_[a-z])/g, group =>
          group.toUpperCase().replace('_', '')
        )]: toCamelCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

/**
 * Specifically handles the unwrapped data payload from the API.
 */
export function transformPayload(data) {
  if (!data) return data;
  return toCamelCase(data);
}
