import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [related, setRelated] = useState([])
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/products/${id}`)
        setProduct(res.data)
        setQuantity(1)
        setAdded(false)

        const rel = await api.get(`/api/products?category=${encodeURIComponent(res.data.category)}&size=8`)
        setRelated(rel.data.content.filter(p => p.id !== res.data.id).slice(0, 4))
      } catch (e) {
        console.error('Failed to load product', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    try {
      await addToCart(product.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (e) {
      console.error('Add to cart failed', e)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link to="/shop" className="btn-primary mt-6">Back to shop</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-brand-600">Shop</Link>
        <span className="mx-2">/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="card overflow-hidden">
          <div className="aspect-square bg-gray-50 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/600x600/eef2ff/1e368a?text=ShopHub'}
            />
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="badge bg-brand-50 text-brand-700 mb-4">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
            {product.inStock ? (
              <span className="badge bg-green-50 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5" />
                In stock
              </span>
            ) : (
              <span className="badge bg-red-50 text-red-600">Sold out</span>
            )}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

          {/* Quantity + Add to cart */}
          {product.inStock && (
            <>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-11 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button onClick={handleAddToCart} className="btn-primary px-8 !py-3 flex-1">
                  {added ? (
                    <span className="flex items-center gap-2">✓ Added to cart</span>
                  ) : (
                    'Add to cart'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {product.stock} units available · Free delivery on orders over ₹999
              </p>
            </>
          )}

          {/* Trust points */}
          <div className="mt-8 border-t border-gray-100 pt-6 grid grid-cols-3 gap-4">
            {[
              { icon: '🚚', label: 'Free delivery' },
              { icon: '↩️', label: '7-day returns' },
              { icon: '🛡️', label: 'Warranty' },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-medium text-gray-600">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group card overflow-hidden transition-all duration-300 hover:shadow-hover"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x400/eef2ff/1e368a?text=ShopHub'}
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">{p.category}</p>
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                  <p className="font-bold text-brand-600 mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}