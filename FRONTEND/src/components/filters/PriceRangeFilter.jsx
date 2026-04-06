import { useState, useEffect } from 'react'

/**
 * Price range slider filter component
 * Allows users to select min and max price values
 */
const PriceRangeFilter = ({ minPrice = 0, maxPrice = 0, onPriceChange, maxPossiblePrice = 10000 }) => {
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice || maxPossiblePrice)

  useEffect(() => {
    setLocalMin(minPrice)
  }, [minPrice])

  useEffect(() => {
    setLocalMax(maxPrice || maxPossiblePrice)
  }, [maxPrice, maxPossiblePrice])

  const handleMinChange = (e) => {
    const value = Math.min(parseFloat(e.target.value), localMax)
    setLocalMin(value)
    onPriceChange(value, localMax)
  }

  const handleMaxChange = (e) => {
    const value = Math.max(parseFloat(e.target.value), localMin)
    setLocalMax(value)
    onPriceChange(localMin, value)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Price Range</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Min: ₹{Math.round(localMin)}</label>
          <input
            type="range"
            min="0"
            max={maxPossiblePrice}
            value={localMin}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Max: ₹{Math.round(localMax)}</label>
          <input
            type="range"
            min="0"
            max={maxPossiblePrice}
            value={localMax}
            onChange={handleMaxChange}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-sm font-medium text-gray-700">
          ₹{Math.round(localMin)} - ₹{Math.round(localMax)}
        </p>
      </div>
    </div>
  )
}

export default PriceRangeFilter
