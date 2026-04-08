/* eslint-disable react-hooks/set-state-in-effect -- data fetching hook resets loading/list state in effect */
import { useEffect, useState } from "react";
import api from "../services/api";
import { normalizeListPayload, listMeta } from "../lib/http";

/**
 * @param {string} url
 * @param {unknown} reload - change to refetch
 * @param {{ asEntity?: boolean }} options - asEntity: single object (e.g. /products/:id)
 */
function useFetch(url, reload, options = {}) {
  const { asEntity = false } = options;
  const [data, setData] = useState(asEntity ? null : []);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!url) {
      const t = requestAnimationFrame(() => {
        if (!isMounted) return;
        setLoading(false);
        setData(asEntity ? null : []);
        setError(null);
      });
      return () => {
        isMounted = false;
        cancelAnimationFrame(t);
      };
    }

    setLoading(true);

    api
      .get(url)
      .then((inner) => {
        if (!isMounted) return;
        setError(null);
        if (asEntity) {
          setData(inner ?? null);
          return;
        }
        setData(normalizeListPayload(inner));
        setMeta(listMeta(inner));
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setData(asEntity ? null : []);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, reload, asEntity]);

  return { data, loading, error, meta };
}

export default useFetch;