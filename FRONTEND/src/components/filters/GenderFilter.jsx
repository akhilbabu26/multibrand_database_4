/**
 * Gender filter component with radio buttons
 */
const GenderFilter = ({ selectedGender, onGenderChange }) => {
  const genders = ['Men', 'Women', 'Unisex']

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800">Gender</h3>

      <div className="space-y-2">
        {genders.map((gender) => (
          <label key={gender} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="gender"
              value={gender.toLowerCase()}
              checked={selectedGender === gender.toLowerCase()}
              onChange={(e) => onGenderChange(e.target.value)}
              className="w-4 h-4 text-blue-600 cursor-pointer accent-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">{gender}</span>
          </label>
        ))}
      </div>

      {selectedGender && (
        <button
          onClick={() => onGenderChange('')}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Clear gender filter
        </button>
      )}
    </div>
  )
}

export default GenderFilter
