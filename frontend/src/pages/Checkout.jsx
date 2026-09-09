import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const { cart, cartCount, cartTotal, loadCart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'COD',
  })
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    loadCart()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPlacing(true)
    try {
      const fullAddress = `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`
      const res = await api.post('/api/orders', {
        shippingAddress: fullAddress,
        paymentMethod: form.paymentMethod,
      })
      setPlacedOrder(res.data)
      await clearCart()
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // Success screen
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order confirmed!</h1>
        <p className="text-gray-500 mt-3">
          Order placed successfully. You'll receive a confirmation shortly.
        </p>
        <div className="card p-6 mt-8 text-left">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold text-gray-900">#{placedOrder.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-gray-900">₹{placedOrder.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className="badge bg-blue-50 text-blue-700">{placedOrder.status}</span>
            </div>
          </div>
          <div className="py-4 space-y-2">
            {placedOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
            📍 Shipping to: {placedOrder.shippingAddress} · 💳 {form.paymentMethod}
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/orders" className="btn-primary">View my orders</Link>
          <Link to="/shop" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    )
  }

  if (cartCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Add some items before checking out.</p>
        <Link to="/shop" className="btn-primary mt-8">Browse products →</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">1</span>
                Shipping details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="input-field !py-3 min-h-[80px]"
                    placeholder="House no., street, area, landmarks..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                    <input type="text" name="state" value={form.state} onChange={handleChange} className="input-field" required />
                  </div>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
                  <input type="text" name="pincode" value={form.pincode} onChange={handleChange} className="input-field" pattern="[0-9]{6}" title="6-digit pincode" required />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">2</span>
                Payment method
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${form.paymentMethod === 'COD' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === 'COD'} onChange={handleChange} className="accent-brand-600" />
                  <span className="text-2xl">💵</span>
                  <span>
                    <span className="block font-semibold text-gray-900 text-sm">Cash on Delivery</span>
                    <span className="text-xs text-gray-500">Pay when your order arrives</span>
                  </span>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${form.paymentMethod === 'UPI' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="paymentMethod" value="UPI" checked={form.paymentMethod === 'UPI'} onChange={handleChange} className="accent-brand-600" />
                  <span className="text-2xl">📱</span>
                  <span>
                    <span className="block font-semibold text-gray-900 text-sm">UPI</span>
                    <span className="text-xs text-gray-500">Pay using any UPI app (demo)</span>
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your order</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">₹{item.total.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
              disabled={placing}
              className="btn-primary w-full !py-3"
            >
              {placing ? 'Placing order...' : `Place order · ₹${cartTotal.toLocaleString('en-IN')}`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Ordering as <span className="font-medium text-gray-600">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}