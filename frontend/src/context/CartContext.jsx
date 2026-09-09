import { createContext, useContext, useState } from 'react'
import api from '../api/client'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)

  const loadCart = async () => {
    try {
      const res = await api.get('/api/cart')
      const items = res.data || []
      setCart(items)
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0))
      setCartTotal(items.reduce((sum, i) => sum + i.total, 0))
    } catch (e) {
      setCart([])
      setCartCount(0)
      setCartTotal(0)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/api/cart', { productId, quantity })
    await loadCart()
    return res.data
  }

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/api/cart/${productId}`, { quantity })
    await loadCart()
    return res.data
  }

  const removeFromCart = async (productId) => {
    await api.delete(`/api/cart/${productId}`)
    await loadCart()
  }

  const clearCart = async () => {
    await api.delete('/api/cart')
    await loadCart()
  }

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartTotal,
      loadCart, addToCart, updateQuantity, removeFromCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}