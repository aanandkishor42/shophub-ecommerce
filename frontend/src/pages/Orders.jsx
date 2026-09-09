import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders')
        setOrders(res.data)
      } catch (e) {
        console.error('Failed to load orders', e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900">No orders yet</h1>
        <p className="text-gray-500 mt-2">When you place an order, it will show up here.</p>
        <Link to="/shop" className="btn-primary mt-8">Start shopping →</Link>
      </div>
    )
  }

  const statusColors = {
    PLACED: 'bg-blue-50 text-blue-700',
    SHIPPED: 'bg-amber-50 text-amber-700',
    DELIVERED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-600',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="font-bold text-gray-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Placed on</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${statusColors[order.status] || statusColors.PLACED}`}>{order.status}</span>
                <p className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 border-t border-gray-50 mt-4 pt-3">
                📍 Ship to: {order.shippingAddress}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}