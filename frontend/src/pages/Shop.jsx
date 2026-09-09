import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState('name')
  const [direction, setDirection] = useState('asc')
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '')
  const PAGE_SIZE = 12

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/products?size=100')
        setCategories([...new Set(res.data.content.map(p => p.category).filter(Boolean))])
      } catch (e) { /* ignore */ }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', page)
        params.set('size', PAGE_SIZE)
        params.set('sort', sort)
        params.set('direction', direction)
        if (category !== 'all') params.set('category', category)
        if (search) params.set('search', search)

        const res = await api.get(`/api/products?${params.toString()}`)
        setProducts(res.data.content)
        setTotal(res.data.totalElements)
      } catch (e) {
        console.error('Failed to fetch', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page, category, search, sort, direction])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(0)
    setSearch(inputValue)
    const params = new URLSearchParams()
    if (inputValue) params.set('search', inputValue)
    if (category !== 'all') params.set('category', category)
    setSearchParams(params)
  }

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setPage(0)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (cat !== 'all') params.set('category', cat)
    setSearchParams(params)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 mt-1">{total} products available</p>
      </div>

      {/* Filters bar */}
      <div className="card p-4 mb-8 flex flex-col lg:flex-row gap-4 lg:items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products..."
              className="input-field !pl-10"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
          </div>
        </form>

        {/* Category dropdown */}
        <div className="lg:w-52">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-field"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} className="input-field lg:w-40">
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="category">Category</option>
          </select>
          <button
            onClick={() => { setDirection(d => d === 'asc' ? 'desc' : 'asc'); setPage(0); }}
            className="btn-outline !px-3"
            title="Toggle sort direction"
          >
            {direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-2">Try a different search term or category.</p>
          <button
            onClick={() => {
              setInputValue(''); setSearch(''); setCategory('all'); setPage(0)
              setSearchParams({})
            }}
            className="btn-outline mt-6"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-outline !px-3 !py-2 disabled:opacity-40"
          >
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                i === page
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-outline !px-3 !py-2 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}