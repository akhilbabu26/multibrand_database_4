/**
 * Stock availability filter toggle
 */
const StockFilter = ({ inStock, onStockChange }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800">Availability</h3>

      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => onStockChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
        />
        <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
      </label>

      {inStock && (
        <button
          onClick={() => onStockChange(false)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Show all products
        </button>
      )}
    </div>
  )
}

export default StockFilter
