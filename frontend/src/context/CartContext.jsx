import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'minishop_cart'

// Cart lives entirely on the client (per spec) and is persisted to localStorage.
// It only turns into a DB order at checkout time.
function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, qty } = action
      const existing = state.find((i) => i.id === product.id)
      const maxQty = product.stock
      if (existing) {
        const nextQty = Math.min(existing.qty + qty, maxQty)
        return state.map((i) => (i.id === product.id ? { ...i, qty: nextQty } : i))
      }
      if (maxQty < 1) return state
      return [
        ...state,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock: product.stock,
          qty: Math.min(qty, maxQty),
        },
      ]
    }
    case 'SET_QTY': {
      const qty = Math.max(1, Math.min(action.qty, action.stock))
      return state.map((i) => (i.id === action.id ? { ...i, qty } : i))
    }
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    return {
      items,
      totalItems,
      totalPrice,
      addItem: (product, qty = 1) => dispatch({ type: 'ADD', product, qty }),
      setQty: (id, qty, stock) => dispatch({ type: 'SET_QTY', id, qty, stock }),
      removeItem: (id) => dispatch({ type: 'REMOVE', id }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
