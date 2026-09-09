import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import ProductCard from '../components/ProductCard'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&q=80'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/products?size=8')
        setFeatured(res.data.content)
        setCategories([...new Set(res.data.content.map(p => p.category))])
      } catch (e) {
        console.error('Failed to fetch products', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 0, transparent 50%), radial-gradient(circle at 80% 20%, white 0, transparent 40%)'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-2xl">
            <span className="badge bg-white/10 text-brand-100 border border-white/20 mb-6">
              🚀 New arrivals every week
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Everything you need.
              <br />
              <span className="text-brand-300">Nothing you don't.</span>
            </h1>
            <p className="mt-6 text-lg text-brand-100/90 max-w-xl">
              ShopHub is a full-stack e-commerce experience — browse a curated catalog,
              manage your cart, and check out securely. Built with Spring Boot & React.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="bg-white text-brand-800 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-brand-50 transition-colors">
                Shop now →
              </Link>
              <a href="#featured" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                Explore featured
              </a>
            </div>
          </div>
        </div>
        {/* Decorative floating cards */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 w-[420px] h-[320px] pointer-events-none">
          <div className="absolute right-0 top-0 w-72 bg-white/10 backdrop-blur rounded-3xl border border-white/20 p-6 rotate-6 shadow-2xl">
            <div className="h-32 rounded-2xl bg-gradient-to-br from-brand-400/60 to-brand-600/60 mb-4 flex items-center justify-center">
              <span className="text-5xl">🎧</span>
            </div>
            <div className="h-3 w-3/4 bg-white/30 rounded mb-2"/>
            <div className="h-3 w-1/2 bg-white/20 rounded mb-3"/>
            <div className="h-8 w-24 bg-white/25 rounded-lg"/>
          </div>
          <div className="absolute left-0 bottom-0 w-56 bg-white/10 backdrop-blur rounded-3xl border border-white/20 p-5 -rotate-6 shadow-2xl">
            <div className="h-24 rounded-2xl bg-gradient-to-br from-brand-300/50 to-brand-500/50 mb-4 flex items-center justify-center">
              <span className="text-4xl">👟</span>
            </div>
            <div className="h-3 w-2/3 bg-white/30 rounded mb-2"/>
            <div className="h-7 w-20 bg-white/25 rounded-lg"/>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Free Delivery', sub: 'On orders over ₹999' },
              { icon: '🔒', title: 'Secure Checkout', sub: 'JWT-protected APIs' },
              { icon: '↩️', title: 'Easy Returns', sub: '7-day no questions' },
              { icon: '🎧', title: '24/7 Support', sub: 'Always here to help' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-gray-500 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">Curated picks</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Featured products</h2>
          </div>
          <Link to="/shop" className="btn-outline text-sm !py-2">View all →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-0 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <Link
                  key={cat}
                  to={`/shop?category=${encodeURIComponent(cat)}`}
                  className={`group rounded-2xl p-6 h-36 flex flex-col justify-between shadow-card border transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 ${
                    i % 2 === 0
                      ? 'bg-gradient-to-br from-brand-50 to-brand-100 border-brand-100'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{['🛒', '👕', '🏠', '⚽'][i % 4]}</span>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{cat}</p>
                    <p className="text-xs text-gray-500 mt-1">Browse →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-12 lg:px-16 lg:py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, white 0, transparent 40%)'
          }} />
          <h2 className="text-3xl lg:text-4xl font-bold text-white relative">
            Ready to try ShopHub?
          </h2>
          <p className="mt-4 text-brand-100 text-lg max-w-2xl mx-auto relative">
            Create an account, grab something from the catalog, and place your first order — all in under a minute.
          </p>
          <div className="mt-8 relative flex flex-wrap justify-center gap-3">
            <Link to="/register" className="bg-white text-brand-800 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-brand-50 transition-colors">
              Get started free
            </Link>
            <Link to="/login" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              I already have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}