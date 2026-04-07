import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * FilterDropdown component
 * A reusable, premium dropdown for select actions.
 */
export default function FilterDropdown({ label, options, selectedValue, onSelect, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selectedOption = options.find(opt => opt.value === selectedValue) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-slate-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95 ${
          selectedValue ? 'border-indigo-500 ring-1 ring-indigo-500' : 'text-slate-700'
        }`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}: {selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 origin-top-left rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5 focus:outline-none z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                selectedValue === option.value
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}