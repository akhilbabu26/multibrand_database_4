import { useMemo, useState } from "react"
import useFetch from "../../Hooks/useFetch"
import ShowProduct from "./ShowProduct"
import { useNavigate } from "react-router-dom"

function Brands() {
    const [selectedBrand, setSelectedBrand] = useState("")
    const [search, setSearch] = useState("")
    const [color, setColor] = useState("")
    const [gender, setGender] = useState("")
    const [type, setType] = useState("")
    const [isActive, setIsActive] = useState("") // "" (all), "true", "false"
    
    // Construct query parameters
    const queryParams = new URLSearchParams()
    if (selectedBrand) queryParams.append("brand", selectedBrand)
    if (search) queryParams.append("search", search)
    if (color) queryParams.append("color", color)
    if (gender) queryParams.append("gender", gender)
    if (type) queryParams.append("type", type)
    if (isActive) queryParams.append("is_active", isActive)
    queryParams.append("limit", "100")

    const { data, loading, error } = useFetch(`/admin/products?${queryParams.toString()}`)
    const navigate = useNavigate()

    const [hiddenIds, setHiddenIds] = useState(() => new Set())

    const filteredProducts = useMemo(
        () => (data || []).filter((item) => !hiddenIds.has(item.id)),
        [data, hiddenIds]
    )

    const brandFilters = ["Adidas", "Nike", "Puma", "Reebok", "New Balance"]

    // Remove product from state immediately
    const handleProductDelete = (deletedProductId) => {
        setHiddenIds((prev) => new Set(prev).add(deletedProductId))
    }

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
                <p className="font-bold">Error loading products</p>
                <p className="text-sm opacity-70">Please check your connection or try again later.</p>
            </div>
        )
    }

    return (
        <div className="bg-white">  
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                
                {/* Search and Filters Bar */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Search</label>
                            <input 
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Gender</label>
                            <select 
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                            >
                                <option value="">All Genders</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="unisex">Unisex</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Type</label>
                            <select 
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                            >
                                <option value="">All Types</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Running">Running</option>
                                <option value="Basketball">Basketball</option>
                                <option value="Training">Training</option>
                            </select>
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Color</label>
                            <input 
                                type="text"
                                placeholder="Filter by color..."
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Activity Status</label>
                            <select 
                                value={isActive}
                                onChange={(e) => setIsActive(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-gray-900 outline-none transition"
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Active Only</option>
                                <option value="false">Inactive Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Brand Filter Buttons */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setSelectedBrand("")}
                                    className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border
                                        ${selectedBrand === ""
                                            ? "bg-gray-900 text-white border-gray-900 scale-105 shadow-lg"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-900"
                                        }`}
                                >
                                    All
                                </button>
                                {brandFilters.map((brand) => (
                                    <button
                                        key={brand}
                                        onClick={() => setSelectedBrand(brand === selectedBrand ? "" : brand)}
                                        className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border
                                            ${selectedBrand === brand
                                                ? "bg-gray-900 text-white border-gray-900 scale-105 shadow-lg"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-900"
                                            }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => {
                                    setSearch("")
                                    setSelectedBrand("")
                                    setGender("")
                                    setColor("")
                                    setType("")
                                    setIsActive("")
                                }}
                                className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition"
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-12 px-6 py-4 bg-gray-900 text-white border-b border-gray-800">
                        <div className="col-span-4 font-black text-xs uppercase tracking-widest opacity-80">Product</div>
                        <div className="col-span-2 font-black text-xs uppercase tracking-widest text-center opacity-80">Cost Price</div>
                        <div className="col-span-2 font-black text-xs uppercase tracking-widest text-center opacity-80">Sale Price</div>
                        <div className="col-span-2 font-black text-xs uppercase tracking-widest text-center opacity-80">Discount</div>
                        <div className="col-span-2 font-black text-xs uppercase tracking-widest text-center opacity-80">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ShowProduct 
                                    key={product.id} 
                                    product={product}
                                    onProductDelete={handleProductDelete}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50/50">
                                <p className="text-gray-400 font-medium">No products match your filters</p>
                                <button 
                                    onClick={() => setSelectedBrand("")}
                                    className="mt-2 text-sm text-blue-600 font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Add Product Button */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                            <button 
                                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 font-bold text-sm uppercase tracking-widest active:scale-95"
                                onClick={() => navigate("/admin/addProduct")}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add New Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Brands
