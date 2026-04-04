import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Add this import
import useFetch from "../../Hooks/useFetch";
import ProductCard from "../../ShoeComponents/ProductCard";

export default function SearchPage() {
  const { data } = useFetch("/products");
  const [filterSearch, setFilterSearch] = useState("");
  const navigate = useNavigate(); // Add this hook

  const filterData = data?.filter(val =>
    val.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    val.color.toLowerCase().includes(filterSearch.toLowerCase()) ||
    val.type.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="w-full p-4">
      {/* TOP BAR */}
      <div className="flex items-center gap-4 bg-white">
        <h2 
          className="ml-4 text-2xl font-extrabold tracking-tight text-gray-900 select-none cursor-pointer"
          onClick={() => navigate("/")}
        >
          {/* MULTI<span className="text-gray-500 border-gray-300 ">BRAND</span> */}
        </h2>
        
        <div className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-2 shadow-sm border border-gray-200">
          <FiSearch className="text-gray-500 text-xl" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search for products, brands, colors..."
            className="bg-transparent w-full ml-3 outline-none text-gray-700"
          />
        </div>
      </div>

      {/* SEARCH RESULTS */}
      <div className="mt-6">
        {filterSearch && filterData.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No products found for "{filterSearch}"
          </p>
        )}
        
        {filterSearch && filterData.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Found {filterData.length} product(s) for "{filterSearch}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filterData.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {!filterSearch && (
          <p className="text-center text-gray-500 py-8">
            Start typing to search for products
          </p>
        )}
      </div>
    </div>
  );
}
