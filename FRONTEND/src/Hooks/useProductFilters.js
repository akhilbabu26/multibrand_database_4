import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo, useEffect } from 'react'

/**
 * Hook to manage product filters via URL search params
 * Provides a clean API to get/set individual filters
 */
export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse filters from URL params
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    type: searchParams.get('type') || '',
    gender: searchParams.get('gender') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : 0,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : 0,
    inStock: searchParams.get('inStock') === 'true',
    page: searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 48,
  }), [searchParams])

  // Debug log whenever filters change
  useEffect(() => {
    console.log('[useProductFilters] Filters parsed from URL:', filters)
  }, [filters])

  // Update a single filter and reset page to 1
  const setFilter = useCallback((key, value) => {
    console.log(`[useProductFilters] Setting filter ${key}:`, value)
    const newParams = new URLSearchParams(searchParams)
    
    if (value === '' || value === null || value === undefined || value === 0 || value === false) {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    
    // Reset to page 1 when filter changes
    if (key !== 'page') {
      newParams.set('page', '1')
    }
    
    console.log(`[useProductFilters] New URL params:`, newParams.toString())
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Update multiple filters at once
  const setFilters = useCallback((filtersObj) => {
    console.log('[useProductFilters] Setting multiple filters:', filtersObj)
    const newParams = new URLSearchParams(searchParams)
    
    Object.entries(filtersObj).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === 0 || value === false) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    
    // Reset to page 1 when filters change
    if (!filtersObj.page) {
      newParams.set('page', '1')
    }
    
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Clear all filters
  const clearFilters = useCallback(() => {
    console.log('[useProductFilters] Clearing all filters')
    setSearchParams({})
  }, [setSearchParams])

  // Set page number
  const setPage = useCallback((page) => {
    console.log('[useProductFilters] Setting page:', page)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'page' || key === 'limit') return false
      return value !== '' && value !== 0 && value !== false
    })
  }, [filters])

  // Get API-ready filters object
  const apiFilters = useMemo(() => {
    const api = {
      search: filters.search || undefined,
      brand: filters.brand || undefined,
      type: filters.type || undefined,
      gender: filters.gender || undefined,
      color: filters.color || undefined,
      size: filters.size || undefined,
      min_price: filters.minPrice > 0 ? filters.minPrice : undefined,
      max_price: filters.maxPrice > 0 ? filters.maxPrice : undefined,
      in_stock: filters.inStock || undefined,
      page: filters.page,
      limit: filters.limit,
    }
    console.log('[useProductFilters] API filters:', api)
    return api
  }, [filters])

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    setPage,
    hasActiveFilters,
    apiFilters,
  }
}
