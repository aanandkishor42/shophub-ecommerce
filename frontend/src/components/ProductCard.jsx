import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.id}` } })
      return
    }
    try {
      await addToCart(product.id, 1)
    } catch (err) {
      console.error('Failed to add to cart', err)
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group card overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5 block"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400/eef2ff/1e368a?text=ShopHub'
          }}
        />
        {!product.inStock && (
          <span className="absolute top-3 left-3 badge bg-gray-800 text-white">Sold Out</span>
        )}
        {product.inStock && product.stock < 10 && (
          <span className="absolute top-3 left-3 badge bg-amber-100 text-amber-700">Only {product.stock} left</span>
        )}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-brand-600 text-white shadow-lg flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-brand-700 disabled:opacity-0"
          aria-label="Add to cart"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-brand-600 mb-1">{product.category}</p>
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors">
              {product.name}
            </h3>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-gray-500">
            {product.inStock ? 'In stock' : 'Unavailable'}
          </span>
        </div>
      </div>
    </Link>
  )
}