import { useEffect, useState } from 'react'
import api from '../api/client'
import { formatPrice } from '../utils/format'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="py-16 text-center text-gray-400">Loading…</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Orders</h1>

      {orders.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <div>
                  <span className="font-semibold text-gray-900">Order #{order.id}</span>
                  <span className="ml-3 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </button>

              {expanded === order.id && (
                <div className="overflow-x-auto border-t border-gray-100 px-4 py-3">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead className="text-left text-xs uppercase text-gray-400">
                      <tr>
                        <th className="py-1">Product</th>
                        <th className="py-1">Price</th>
                        <th className="py-1">Qty</th>
                        <th className="py-1 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="text-gray-700">
                          <td className="py-1">{item.product_name}</td>
                          <td className="py-1">{formatPrice(item.price)}</td>
                          <td className="py-1">{item.qty}</td>
                          <td className="py-1 text-right">{formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
