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
 */
export function normalizeListPayload(inner) {
  if (inner == null) return [];
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(inner.products)) return inner.products;
  if (Array.isArray(inner.orders)) return inner.orders;
  if (Array.isArray(inner.users)) return inner.users;
  if (Array.isArray(inner.wishlist)) return inner.wishlist;
  if (Array.isArray(inner.addresses)) return inner.addresses;
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
