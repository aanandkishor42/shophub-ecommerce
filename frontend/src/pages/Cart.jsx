import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, cartCount, cartTotal, loadCart, updateQuantity, removeFromCart } = useCart()

  useEffect(() => {
    loadCart()
  }, [])

  if (cartCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-8">Start shopping →</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Shopping cart <span className="text-gray-400 text-xl font-medium">({cartCount} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="card p-4 sm:p-5 flex gap-4">
              <Link to={`/product/${item.productId}`} className="shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200x200/eef2ff/1e368a?text=ShopHub'}
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/product/${item.productId}`} className="font-semibold text-gray-900 hover:text-brand-700 truncate block">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">₹{item.unitPrice.toLocaleString('en-IN')} each</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-9 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-9 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">₹{item.total.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span className="font-medium text-gray-900">Included</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full mt-6 !py-3">
              Proceed to checkout →
            </Link>
            <Link to="/shop" className="btn-outline w-full mt-3">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}