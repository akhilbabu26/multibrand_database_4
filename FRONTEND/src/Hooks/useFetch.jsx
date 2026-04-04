import { useEffect, useState } from "react";
import api from "../services/api";

function useFetch(url, reload) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .get(url)
      .then((res) => {
        if (isMounted) {
          const result = res.data?.data ?? res.data;
          setData(Array.isArray(result) ? result : []);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setData([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, reload]);

  return { data, loading, error };
}

export default useFetch;