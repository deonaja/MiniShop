import { useEffect, useState } from 'react'
import api from '../api/client'
import ProductCard from '../components/ProductCard'

export default function CatalogPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load the full category list once (independent of active filters).
  useEffect(() => {
    api
      .get('/products')
      .then((res) => {
        const unique = [...new Set(res.data.data.map((p) => p.category))].sort()
        setCategories(unique)
      })
      .catch(() => {})
  }, [])

  // Fetch products whenever search/category changes (debounced).
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      api
        .get('/products', {
          params: { search: search || undefined, category: category || undefined },
          signal: controller.signal,
        })
        .then((res) => {
          setProducts(res.data.data)
          setError(null)
        })
        .catch((err) => {
          if (err.name !== 'CanceledError') setError('Failed to load products.')
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, category])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Catalog</h1>
        <p className="mt-1 text-gray-500">Browse products and add them to your cart.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-150 active:scale-95 ${
              category === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-150 active:scale-95 ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-300 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="py-16 text-center text-gray-400">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No products match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
