import React, { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CustomerLayout from '../components/layout/CustomerLayout'
import FourCard from '../ShoeComponents/FourCard'
import FirstSection from './FirstSection'
import useFetch from '../Hooks/useFetch'
import ProductCard from '../ShoeComponents/ProductCard'
import { X } from 'lucide-react'

function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const resultsRef = useRef(null)

  const q = (searchParams.get('q') || '').trim()
  const type = searchParams.get('type') || ''
  const searching = q.length >= 2

  const productsUrl = useMemo(() => {
    if (!searching) return null
    const params = new URLSearchParams({ search: q, limit: '48' })
    if (type) params.set('type', type)
    return `/products?${params.toString()}`
  }, [q, type, searching])

  const { data, loading } = useFetch(productsUrl)

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
          className="scroll-mt-20 border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
                  Results for &quot;{q}&quot;
                </h2>
                {type ? (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Narrowed by selected category
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" aria-hidden />
                Clear search
              </button>
            </div>

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
