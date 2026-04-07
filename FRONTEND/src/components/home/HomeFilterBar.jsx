import React from 'react';
import FilterDropdown from '../shared/FilterDropdown';
import { Tag, User, IndianRupee, RotateCcw } from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Any Price', value: 'all' },
  { label: 'Under ₹1,000', value: '0-1000' },
  { label: '₹1,000 - ₹5,000', value: '1000-5000' },
  { label: '₹5,000 - ₹10,000', value: '5000-10000' },
  { label: 'Over ₹10,000', value: '10000-0' },
];

const BRANDS = [
  { label: 'All Brands', value: '' },
  { label: 'Adidas', value: 'Adidas' },
  { label: 'Nike', value: 'Nike' },
  { label: 'Puma', value: 'Puma' },
  { label: 'Reebok', value: 'Reebok' },
  { label: 'New Balance', value: 'New Balance' },
];

const GENDERS = [
  { label: 'All Genders', value: '' },
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Unisex', value: 'Unisex' },
];

export default function HomeFilterBar({ 
  selectedBrand, 
  onBrandChange, 
  selectedGender, 
  onGenderChange, 
  minPrice, 
  maxPrice, 
  onPriceChange,
  onClearAll 
}) {
  
  const currentPriceValue = minPrice === 0 && maxPrice === 0 
    ? 'all' 
    : `${minPrice}-${maxPrice}`;

  const handlePriceSelect = (val) => {
    if (val === 'all') {
      onPriceChange(0, 0);
    } else {
      const [min, max] = val.split('-').map(Number);
      onPriceChange(min, max);
    }
  };

  const hasFilters = selectedBrand || selectedGender || minPrice > 0 || maxPrice > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-1 duration-500">
      <FilterDropdown 
        label="Price"
        icon={IndianRupee}
        options={PRICE_RANGES}
        selectedValue={currentPriceValue}
        onSelect={handlePriceSelect}
      />

      <FilterDropdown 
        label="Brand"
        icon={Tag}
        options={BRANDS}
        selectedValue={selectedBrand}
        onSelect={onBrandChange}
      />

      <FilterDropdown 
        label="Gender"
        icon={User}
        options={GENDERS}
        selectedValue={selectedGender}
        onSelect={onGenderChange}
      />

      {hasFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-rose-600 uppercase tracking-widest hover:text-rose-700 transition active:scale-95 group"
        >
          <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-90" />
          Clear All
        </button>
      )}
    </div>
  );
}
