/**
 * Single-select filter component with radio buttons
 * Used for filtering by a single color or size
 */
const SingleSelectFilter = ({ title, options, selectedValue, onSelectionChange }) => {
  const handleSelect = (value) => {
    // Toggle selection - clicking same option again deselects it
    onSelectionChange(selectedValue === value ? '' : value)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {selectedValue && (
          <button
            onClick={() => onSelectionChange('')}
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
              type="radio"
              name={title.toLowerCase()}
              value={option}
              checked={selectedValue === option}
              onChange={() => handleSelect(option)}
              className="w-4 h-4 text-blue-600 cursor-pointer accent-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
          </label>
        ))}
      </div>

      {selectedValue && (
        <div className="pt-2 border-t">
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {selectedValue}
          </span>
        </div>
      )}
    </div>
  )
}

export default SingleSelectFilter
