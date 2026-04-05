import { useState, useEffect, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useFetch from "../../Hooks/useFetch";
import ProductCard from "../../ShoeComponents/ProductCard";

export default function SearchPage() {
  const [filterSearch, setFilterSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(filterSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [filterSearch]);

  const url = useMemo(() => {
    if (debounced.length < 2) return null;
    return `/products?search=${encodeURIComponent(debounced)}&limit=48`;
  }, [debounced]);

  const { data, loading } = useFetch(url);

  return (
    <div className="w-full p-4">
      <div className="flex items-center gap-4 bg-white">
        <h2
          className="ml-4 text-2xl font-extrabold tracking-tight text-gray-900 select-none cursor-pointer"
          onClick={() => navigate("/")}
        >
          Search
        </h2>

        <div className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-2 shadow-sm border border-gray-200">
          <FiSearch className="text-gray-500 text-xl" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search products, colors, types…"
            className="bg-transparent w-full ml-3 outline-none text-gray-700"
          />
        </div>
      </div>

      <div className="mt-6">
        {filterSearch.trim().length > 0 && filterSearch.trim().length < 2 && (
          <p className="text-center text-gray-500 py-8">Type at least 2 characters</p>
        )}

        {loading && debounced.length >= 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && debounced.length >= 2 && data.length === 0 && (
          <p className="text-center text-gray-500 py-8">No products found for &quot;{debounced}&quot;</p>
        )}

        {!loading && data.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {data.length} result(s) for &quot;{debounced}&quot;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {filterSearch.trim().length === 0 && (
          <p className="text-center text-gray-500 py-8">Start typing to search the catalog</p>
        )}
      </div>
    </div>
  );
}
