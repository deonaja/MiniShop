import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

export default function CartPage() {
  const { items, totalPrice, setQty, removeItem, clear } = useCart()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  async function handleCheckout() {
    setPlacing(true)
    setError(null)
    try {
      const payload = { items: items.map((i) => ({ product_id: i.id, qty: i.qty })) }
      const res = await api.post('/checkout', payload)
      setOrder(res.data.data)
      clear()
    } catch (err) {
      const msg =
        err.response?.data?.errors?.items?.[0] ??
        err.response?.data?.message ??
        'Checkout failed. Please try again.'
      setError(msg)
    } finally {
      setPlacing(false)
    }
  }

  if (order) {
    return (
      <div className="fade-in mx-auto max-w-md rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-green-800">Order placed! 🎉</h1>
        <p className="mt-2 text-green-700">
          Order #{order.id} · Total {formatPrice(order.total)}
        </p>
        <Link
          to="/"
          className="btn-press mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Browse the catalog →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <img src={item.image_url} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
              {item.qty >= item.stock && (
                <p className="text-xs text-amber-600">Max stock reached ({item.stock})</p>
              )}
            </div>
            {/* Controls: inline on desktop, own full-width row on mobile */}
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <input
                type="number"
                min={1}
                max={item.stock}
                value={item.qty}
                onChange={(e) => setQty(item.id, Number(e.target.value) || 1, item.stock)}
                className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="w-20 text-right font-semibold text-gray-900">
                {formatPrice(item.price * item.qty)}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="btn-press text-sm text-gray-400 hover:text-red-600"
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={clear} className="text-sm text-gray-500 hover:text-red-600">
          Clear cart
        </button>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={placing}
        className="btn-press mt-4 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
      >
        {placing ? 'Placing order…' : 'Checkout'}
      </button>
    </div>
  )
}
