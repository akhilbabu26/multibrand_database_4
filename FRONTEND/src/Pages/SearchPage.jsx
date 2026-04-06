import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FiSearch } from "react-icons/fi"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useProductFilters } from "../Hooks/useProductFilters"
import productService from "../services/product.service"
import ProductCard from "../ShoeComponents/ProductCard"
import FilterSidebar from "../components/filters/FilterSidebar"
import { Menu, X } from "lucide-react"

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { filters, setFilter, setFilters, clearFilters, apiFilters } = useProductFilters()
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || "")

  // Sync search input with URL params
  useEffect(() => {
    const q = searchParams.get("q")
    if (q && q !== filters.search) {
      console.log('[SearchPage] Syncing URL search param:', q)
      setFilter("search", q)
      setSearchInput(q)
    }
  }, [searchParams, filters.search, setFilter])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== filters.search) {
        console.log('[SearchPage] Debounced search update:', searchInput.trim())
        setFilter("search", searchInput.trim())
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, filters.search, setFilter])

  // Log filter state changes for debugging
  useEffect(() => {
    console.log('[SearchPage] Filters updated:', {
      search: filters.search,
      brand: filters.brand,
      type: filters.type,
      gender: filters.gender,
      color: filters.color,
      size: filters.size,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.inStock,
      page: filters.page,
    })
  }, [filters])

  // Fetch products using React Query
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ["products", apiFilters],
    queryFn: async () => {
      console.log('[SearchPage] Fetching products with API filters:', apiFilters)
      const response = await productService.getProducts({
        search: apiFilters.search || undefined,
        brand: apiFilters.brand || undefined,
        type: apiFilters.type || undefined,
        gender: apiFilters.gender || undefined,
        color: apiFilters.color || undefined,
        size: apiFilters.size || undefined,
        min_price: apiFilters.min_price || undefined,
        max_price: apiFilters.max_price || undefined,
        in_stock: apiFilters.in_stock || undefined,
        page: apiFilters.page,
        limit: apiFilters.limit,
      })
      console.log('[SearchPage] API Response:', response)
      return response
    },
    enabled: filters.search.trim().length >= 2 || filters.brand || filters.type || filters.gender || filters.color || filters.size || filters.minPrice > 0 || filters.maxPrice > 0,
  })

  const products = productsData?.data?.products || []
  const totalCount = productsData?.data?.total || 0

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <h2
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 select-none cursor-pointer whitespace-nowrap"
              onClick={() => navigate("/")}
            >
              Search
            </h2>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              {showFilters ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-2 shadow-sm border border-gray-200">
            <FiSearch className="text-gray-500 text-lg flex-shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products, colors, brands..."
              className="bg-transparent w-full ml-3 outline-none text-sm sm:text-base text-gray-700"
            />
          </div>
        </div>

      {/* Active filters badges */}
        {(filters.brand || filters.gender || filters.minPrice > 0 || filters.maxPrice > 0 || filters.color || filters.size || filters.inStock) && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-2">
            {filters.brand && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.brand}
                <button onClick={() => setFilter("brand", "")} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {filters.gender && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.gender}
                <button onClick={() => setFilter("gender", "")} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {filters.minPrice > 0 || filters.maxPrice > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                ₹{filters.minPrice} - ₹{filters.maxPrice || "∞"}
                <button onClick={() => setFilters({ minPrice: 0, maxPrice: 0 })} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {filters.color && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.color}
                <button onClick={() => setFilter("color", "")} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Size: {filters.size}
                <button onClick={() => setFilter("size", "")} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {filters.inStock && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                In Stock
                <button onClick={() => setFilter("inStock", false)} className="hover:text-blue-900">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-6 p-4">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setShowFilters(false)}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            >
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
                isLoading={isLoading}
                isMobile={true}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="flex-grow">
          {/* No Search/Filters Message */}
          {searchInput.trim().length === 0 && !filters.brand && !filters.type && !filters.gender && !filters.color && !filters.size && filters.minPrice === 0 && filters.maxPrice === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Start typing to search the catalog</p>
            </div>
          )}

          {/* Minimum Characters Warning */}
          {searchInput.trim().length > 0 && searchInput.trim().length < 2 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Type at least 2 characters to search</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (filters.search.trim().length >= 2 || filters.type || filters.gender || filters.color || filters.size) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse h-80 bg-gray-200 rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading products. Please try again.</p>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && products.length === 0 && (filters.search.trim().length >= 2 || filters.brand || filters.type || filters.gender || filters.color || filters.size) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Results */}
          {!isLoading && products.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{products.length}</span> of <span className="font-semibold">{totalCount}</span> products
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
