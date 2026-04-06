import { X } from 'lucide-react'

/**
 * Multi-select checkbox filter component
 * Used for filtering by size, color, etc.
 */
const MultiSelectFilter = ({ title, options, selectedValues, onSelectionChange }) => {
  const handleCheck = (value) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onSelectionChange(updated)
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {selectedValues?.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {options?.map((option) => (
          <label key={option} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={selectedValues?.includes(option) || false}
              onChange={() => handleCheck(option)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
          </label>
        ))}
      </div>

      {selectedValues?.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {value}
                <button
                  onClick={() => handleCheck(value)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelectFilter
