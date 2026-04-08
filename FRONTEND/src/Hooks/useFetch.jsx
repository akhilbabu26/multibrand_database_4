import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { normalizeListPayload, listMeta } from "../lib/http";

/**
 * @param {string} url
 * @param {unknown} reload - change to refetch
 * @param {{ asEntity?: boolean }} options - asEntity: single object (e.g. /products/:id)
 */
function useFetch(url, reload, options = {}) {
  const { asEntity = false } = options;

  // Determine query key root to match global invalidation (e.g. "products")
  const rootKey = url && url.startsWith("/products") ? "products" : "fetch";
  const queryKey = url ? [rootKey, url, reload, options] : ["empty"];

  const { data: rawData, isLoading: loading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get(url);
      return res;
    },
    enabled: !!url,
  });

  let data = asEntity ? null : [];
  let meta = { total: 0, page: 1, limit: 10 };

  if (rawData && !error) {
    if (asEntity) {
      data = rawData;
    } else {
      data = normalizeListPayload(rawData);
      meta = listMeta(rawData);
    }
  }

  return { data, loading, error, meta };
}

export default useFetch;