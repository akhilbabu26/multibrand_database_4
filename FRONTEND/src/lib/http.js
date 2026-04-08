/**
 * Normalizes API envelopes: { success, message, data } from the Go backend.
 */

export function unwrapData(body) {
  if (body == null) return null;
  if (typeof body === 'object' && 'data' in body && body.data !== undefined) {
    return body.data;
  }
  return body;
}

/**
 * Turns list endpoints into a flat array (products, orders, users, wishlist, etc.).
 * Robustly checks for common entity collection keys or a generic 'items' fallback.
 */
export function normalizeListPayload(inner) {
  if (inner == null) return [];
  if (Array.isArray(inner)) return inner;
  
  // Check for common entity keys
  const keys = ['products', 'orders', 'users', 'wishlist', 'addresses', 'items', 'data'];
  for (const key of keys) {
    if (Array.isArray(inner[key])) return inner[key];
  }

  // Fallback: search for any array property if there's only one
  const arrays = Object.values(inner).filter(v => Array.isArray(v));
  if (arrays.length === 1) return arrays[0];

  return [];
}

export function listMeta(inner) {
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) {
    return { total: 0, page: 1, limit: 10 };
  }
  return {
    total: inner.total ?? 0,
    page: inner.page ?? 1,
    limit: inner.limit ?? 10,
  };
}

export function getErrorMessage(err) {
  if (!err) return 'Something went wrong';
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string' && !err.response) return err.message;
  const d = err.response?.data ?? err;
  if (d?.message) return d.message;
  if (Array.isArray(d?.details)) return d.details.join(', ');
  return 'Request failed';
}
