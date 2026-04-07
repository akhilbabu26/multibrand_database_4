import React, { useEffect, useMemo, useRef, useContext } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import CustomerLayout from '../components/layout/CustomerLayout'
import FourCard from '../ShoeComponents/FourCard'
import FirstSection from './FirstSection'
import useFetch from '../Hooks/useFetch'
import ProductCard from '../ShoeComponents/ProductCard'
import { X } from 'lucide-react'
import { AuthContext } from '../Context/AuthContext'
import HomeFilterBar from '../components/home/HomeFilterBar'

function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const resultsRef = useRef(null)
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, loading: authLoading } = useContext(AuthContext)

  // Filter States
  const q = (searchParams.get('q') || '').trim()
  const type = searchParams.get('type') || ''
  const brand = searchParams.get('brand') || ''
  const gender = searchParams.get('gender') || ''
  const minPrice = Number(searchParams.get('minPrice') || 0)
  const maxPrice = Number(searchParams.get('maxPrice') || 0)

  const searching = q.length >= 2 || brand || gender || minPrice > 0 || maxPrice > 0

  useEffect(() => {
    if (!authLoading && isAuthenticated && String(currentUser?.role || "").toLowerCase() === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [authLoading, isAuthenticated, currentUser, navigate])

  const productsUrl = useMemo(() => {
    if (!searching) return null
    const params = new URLSearchParams({ search: q, limit: '48' })
    if (type) params.set('type', type)
    if (brand) params.set('brand', brand)
    if (gender) params.set('gender', gender)
    if (minPrice > 0) params.set('min_price', minPrice.toString())
    if (maxPrice > 0) params.set('max_price', maxPrice.toString())
    return `/products?${params.toString()}`
  }, [q, type, brand, gender, minPrice, maxPrice, searching])

  const { data, loading } = useFetch(productsUrl)

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, val]) => {
      if (val === '' || val === 0 || val === 'all') {
        newParams.delete(key)
      } else {
        newParams.set(key, val)
      }
    })
    setSearchParams(newParams)
  }

  const clearAllFilters = () => {
    const newParams = new URLSearchParams()
    if (q) newParams.set('q', q)
    if (type) newParams.set('type', type)
    setSearchParams(newParams)
  }

  useEffect(() => {
    if (searching && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searching, q, type])

  const clearSearch = () => {
    setSearchParams({})
  }

  return (
    <CustomerLayout>
      <FirstSection />

      {searching && (
        <section
          ref={resultsRef}
          className="scroll-mt-20 border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 py-12"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl uppercase">
                  Results for &quot;{q || 'All Products'}&quot;
                </h2>
                {type ? (
                  <p className="mt-1 text-sm font-bold uppercase tracking-widest text-indigo-600">
                    Category: {type}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" aria-hidden />
                New Search
              </button>
            </div>

            <HomeFilterBar 
                selectedBrand={brand}
                selectedGender={gender}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onBrandChange={(b) => updateFilters({ brand: b })}
                onGenderChange={(g) => updateFilters({ gender: g })}
                onPriceChange={(min, max) => updateFilters({ minPrice: min, maxPrice: max })}
                onClearAll={clearAllFilters}
            />

            {loading && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                  />
                ))}
              </div>
            )}

            {!loading && data.length === 0 && (
              <p className="py-12 text-center text-slate-500 dark:text-slate-400">
                No products found. Try different keywords or{' '}
                <Link to="/" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  browse all
                </Link>
                .
              </p>
            )}

            {!loading && data.length > 0 && (
              <>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  {data.length} result{data.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                  {data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {!searching && <FourCard />}
    </CustomerLayout>
  )
}

export default Home
