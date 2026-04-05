import { useMemo, useState } from "react"
import useFetch from "../../Hooks/useFetch"
import ShowProduct from "./ShowProduct"
import { useNavigate } from "react-router-dom"

function Brands() {
    const [selectedBrand, setSelectedBrand] = useState("Casual Retro Runner")
    const { data, loading, error} = useFetch("/admin/products?limit=100")
    const navigate = useNavigate()

    const [hiddenIds, setHiddenIds] = useState(() => new Set())

    const brands = useMemo(
        () => (data || []).filter((item) => item.type === selectedBrand && !hiddenIds.has(item.id)),
        [data, selectedBrand, hiddenIds]
    )

    const brandFilters = [
        { name: "ADIDAS", type: "Casual Retro Runner" },
        { name: "NIKE", type: "Lifestyle Basketball Sneaker" },
        { name: "PUMA", type: "Performance & Motorsport" },
        { name: "REEBOK", type: "Heritage Court & Fitness" },
        { name: "NEW BALANCE", type: "Premium Heritage Runner" }
    ]

    // Remove product from state immediately
    const handleProductDelete = (deletedProductId) => {
        setHiddenIds((prev) => new Set(prev).add(deletedProductId))
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error loading products</div>
    }

    return (
        <div className="bg-white">  
            <div className="text-center mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                
                {/* Brand Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {brandFilters.map((brand) => (
                        <button
                            key={brand.type}
                            onClick={() => setSelectedBrand(brand.type)}
                            className={`inline-block rounded-md px-6 py-3 text-center font-medium border transition-colors duration-200 
                                ${
                                selectedBrand === brand.type
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-12 px-6 py-4 bg-gray-100/50 border-b border-gray-200">
                        <div className="col-span-4 font-medium text-gray-700 text-sm uppercase tracking-wide">Product</div>
                        <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Cost</div>
                        <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Selling</div>
                        <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Discount</div>
                        <div className="col-span-2 font-medium text-gray-700 text-sm uppercase tracking-wide text-center">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200/60">
                        {brands?.length > 0 ? (
                            brands?.map(product => (
                                <ShowProduct 
                                    key={product.id} 
                                    product={product}
                                    onProductDelete={handleProductDelete}  // props passed to update delete product
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No products found for selected brand
                            </div>
                        )}

                        {/* Add Product Button */}
                        <div className="p-4">
                            <button 
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm"
                                onClick={() => navigate("/admin/addProduct")}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Brands
