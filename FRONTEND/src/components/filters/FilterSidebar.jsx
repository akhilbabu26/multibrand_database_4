import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import PriceRangeFilter from './PriceRangeFilter'
import SingleSelectFilter from './SingleSelectFilter'
import GenderFilter from './GenderFilter'
import StockFilter from './StockFilter'
import productService from '../../services/product.service'

/**
 * FilterSidebar component
 * Combines all filter controls and manages filter state
 */
const FilterSidebar = ({ 
  filters, 
  onFilterChange,
  onClearFilters,
  isLoading = false,
  isMobile = false,
  onClose = () => {} 
}) => {
  const [expandedSection, setExpandedSection] = useState({
    price: true,
    brand: true,
    gender: true,
    size: true,
    color: true,
    stock: true,
  })

  const [metadata, setMetadata] = useState({
    brands: [],
    sizes: [],
    colors: [],
    genders: [],
    types: [],
  })

  useEffect(() => {
    productService.getMetadata()
        .then(data => {
            setMetadata({
                brands: data.brands || [],
                sizes: data.sizes || [],
                colors: data.colors || [],
                genders: data.genders || [],
                types: data.types || [],
            })
        })
        .catch(err => console.error('[FilterSidebar] Metadata fetch failed:', err))
  }, [])

  const availableOptions = metadata;

  const toggleSection = (section) => {
    setExpandedSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePriceChange = (min, max) => {
    console.log('[FilterSidebar] Price changed:', { min, max })
    onFilterChange({
      minPrice: min > 0 ? min : 0,
      maxPrice: max > 0 ? max : 0,
    })
  }

  const handleBrandChange = (selectedBrand) => {
    console.log('[FilterSidebar] Brand filter changed:', selectedBrand)
    onFilterChange({
      brand: selectedBrand || '',
    })
  }

  const handleSizeChange = (selectedSize) => {
    console.log('[FilterSidebar] Size filter changed:', selectedSize)
    onFilterChange({
      size: selectedSize || '',
    })
  }

  const handleColorChange = (selectedColor) => {
    console.log('[FilterSidebar] Color filter changed:', selectedColor)
    onFilterChange({
      color: selectedColor || '',
    })
  }

  const handleGenderChange = (gender) => {
    console.log('[FilterSidebar] Gender filter changed:', gender)
    onFilterChange({ gender: gender || '' })
  }

  const handleStockChange = (inStock) => {
    console.log('[FilterSidebar] Stock filter changed:', inStock)
    onFilterChange({ inStock })
  }

  const selectedBrand = filters.brand || ''
  const selectedSize = filters.size || ''
  const selectedColor = filters.color || ''

  const sidebarClasses = `
    ${isMobile ? 'fixed inset-0 z-40 bg-white overflow-y-auto pt-16' : 'bg-gray-50 rounded-lg p-6'}
    ${!isMobile ? 'h-max' : ''}
  `

  const sidebarInnerClasses = isMobile ? 'px-4 py-6' : ''

  return (
    <div className={sidebarClasses}>
      {/* Close button for mobile */}
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={24} />
        </button>
      )}

      <div className={sidebarInnerClasses}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Filters</h2>
          {filters.q && (
            <p className="text-sm text-gray-600">
              Search: <span className="font-medium">{filters.q}</span>
            </p>
          )}
          {filters.brand && (
            <p className="text-sm text-gray-600">
              Brand: <span className="font-medium capitalize">{filters.brand}</span>
            </p>
          )}
          {filters.type && (
            <p className="text-sm text-gray-600">
              Type: <span className="font-medium capitalize">{filters.type}</span>
            </p>
          )}
        </div>

        {/* Clear Filters Button */}
        {(
          filters.minPrice > 0 ||
          filters.maxPrice > 0 ||
          filters.brand ||
          filters.gender ||
          filters.color ||
          filters.size ||
          filters.inStock
        ) && (
          <button
            onClick={onClearFilters}
            disabled={isLoading}
            className="w-full mb-6 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm font-medium transition"
          >
            Clear All Filters
          </button>
        )}

        {/* Price Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-100 rounded px-2"
          >
            <h3 className="font-semibold text-gray-900">Price</h3>
            <ChevronDown 
              size={20} 
              className={`transition ${expandedSection.price ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSection.price && (
            <div className="mt-4 px-2">
              <PriceRangeFilter
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onPriceChange={handlePriceChange}
                maxPossiblePrice={10000}
              />
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-100 rounded px-2"
          >
            <h3 className="font-semibold text-gray-900">Brand</h3>
            <ChevronDown 
              size={20} 
              className={`transition ${expandedSection.brand ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSection.brand && (
            <div className="mt-4 px-2">
              <SingleSelectFilter
                title="Select Brand"
                options={availableOptions.brands}
                selectedValue={selectedBrand}
                onSelectionChange={handleBrandChange}
              />
            </div>
          )}
        </div>

        {/* Gender Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('gender')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-100 rounded px-2"
          >
            <h3 className="font-semibold text-gray-900">Gender</h3>
            <ChevronDown 
              size={20} 
              className={`transition ${expandedSection.gender ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSection.gender && (
            <div className="mt-4 px-2">
              <GenderFilter
                selectedGender={filters.gender}
                onGenderChange={handleGenderChange}
              />
            </div>
          )}
        </div>

        {/* Size Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('size')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-100 rounded px-2"
          >
            <h3 className="font-semibold text-gray-900">Size</h3>
            <ChevronDown 
              size={20} 
              className={`transition ${expandedSection.size ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSection.size && (
            <div className="mt-4 px-2">
              <SingleSelectFilter
                title="Select Size"
                options={availableOptions.sizes}
                selectedValue={selectedSize}
                onSelectionChange={handleSizeChange}
              />
            </div>
          )}
        </div>

        {/* Color Filter */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => toggleSection('color')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-100 rounded px-2"
          >
            <h3 className="font-semibold text-gray-900">Color</h3>
            <ChevronDown 
              size={20} 
              className={`transition ${expandedSection.color ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSection.color && (
            <div className="mt-4 px-2">
              <SingleSelectFilter
                title="Select Color"
                options={availableOptions.colors}
                selectedValue={selectedColor}
                onSelectionChange={handleColorChange}
              />
            </div>
          )}
        </div>

        {/* Stock Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('stock')}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-100 rounded px-2"
          >
            <h3 className="font-semibold text-gray-900">Availability</h3>
            <ChevronDown 
              size={20} 
              className={`transition ${expandedSection.stock ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSection.stock && (
            <div className="mt-4 px-2">
              <StockFilter
                inStock={filters.inStock}
                onStockChange={handleStockChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterSidebar
